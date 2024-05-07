#
# SPDX-License-Identifier: Apache-2.0
#
import logging
import base64
import shutil
import os
import threading
import yaml
import traceback

from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import Paginator
from django.http import HttpResponse
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated

from api.common.enums import AgentOperation
from api.exceptions import CustomError, NoResource, ResourceExists, ResourceInUse
from api.exceptions import ResourceNotFound
from api.models import (
    Node,
    Port,
    FabricCA,
    FabricCAServerType,
    NodeUser,
    FabricPeer,
    PeerCa,
    PeerCaUser,
    ResourceSet,
)
from api.routes.node.serializers import (
    NodeOperationSerializer,
    NodeQuery,
    NodeCreateBody,
    NodeIDSerializer,
    NodeListSerializer,
    NodeUpdateBody,
    # NodeFileCreateSerializer,
    # NodeInfoSerializer,
    NodeStatusSerializer,
    NodeUserCreateSerializer,
    NodeUserIDSerializer,
    NodeUserPatchSerializer,
    NodeUserQuerySerializer,
    NodeUserListSerializer,
    NodeConfigFileSerializer,
)
from api.tasks import operate_node
from api.utils.common import with_common_response
from api.lib.pki import CryptoGen, CryptoConfig
from api.utils import zip_dir, zip_file
from api.config import CELLO_HOME, FABRIC_NODE, PRODUCTION_NODE
from api.utils.node_config import NodeConfig
from api.lib.agent import AgentHandler
from api.utils.port_picker import set_ports_mapping, find_available_ports
from api.common import ok, err
from api.routes.channel.views import init_env_vars, join_peers
from api.utils.host import add_host


LOG = logging.getLogger(__name__)


class NodeViewSet(viewsets.ViewSet):
    permission_classes = [
        IsAuthenticated,
    ]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    # Only operator can update node info
    # def get_permissions(self):
    #     if self.action in ["update"]:
    #         permission_classes = (IsAuthenticated, IsOperatorAuthenticated)
    #     else:
    #         permission_classes = (IsAuthenticated,)
    #
    #     return [permission() for permission in permission_classes]

    @staticmethod
    def _validate_organization(request):
        if request.user.organization is None:
            raise CustomError(detail="Need join in organization.")

    @swagger_auto_schema(
        query_serializer=NodeQuery,
        responses=with_common_response(
            with_common_response({status.HTTP_200_OK: NodeListSerializer})
        ),
    )
    def list(self, request, *args, **kwargs):
        """
        List node

        :param request: query parameter
        :return: node list
        :rtype: list
        """
        try:
            serializer = NodeQuery(data=request.GET)
            if serializer.is_valid(raise_exception=True):
                page = serializer.validated_data.get("page")
                per_page = serializer.validated_data.get("per_page")
                node_type = serializer.validated_data.get("type")
                name = serializer.validated_data.get("name")
                agent_id = serializer.validated_data.get("agent_id")

                resource_set_id = request.parser_context["kwargs"].get(
                    "resource_set_id"
                )
                resource_set = ResourceSet.objects.get(pk=resource_set_id)
                fabric_resource_set = resource_set.sub_resource_set.get()

                # if agent_id is not None and not request.user.is_operator:
                #     raise PermissionDenied
                query_filter = {}

                if node_type:
                    query_filter.update({"type": node_type})
                if name:
                    query_filter.update({"name__icontains": name})
                if agent_id:
                    query_filter.update({"agent__id": agent_id})
                if resource_set_id:
                    query_filter.update({"fabric_resource_set": fabric_resource_set})
                nodes = Node.objects.filter(**query_filter)
                p = Paginator(nodes, per_page)
                nodes = p.page(page)
                return_node_list = [
                    {
                        "id": node.id,
                        "name": node.name,
                        "type": node.type,
                        "owner": resource_set.name,
                        "org_id": resource_set.membership.loleido_organization.id,
                    }
                    for node in nodes
                ]
                return Response(data=return_node_list, status=status.HTTP_200_OK)
        except Exception as e:
            traceback.print_exc()
            return Response(err(e.args), status=status.HTTP_400_BAD_REQUEST)

    def _save_fabric_ca(self, request, ca=None):
        if ca is None:
            return None

        ca_body = {}
        admin_name = ca.get("admin_name")
        admin_password = ca.get("admin_password")
        # If found tls type ca server under this organization,
        # will cause resource exists error
        ca_server_type = ca.get("type", FabricCAServerType.Signature.value)
        if ca_server_type == FabricCAServerType.TLS.value:
            exist_ca_server = Node.objects.filter(
                organization=request.user.organization,
                ca__type=FabricCAServerType.TLS.value,
            ).count()
            if exist_ca_server > 0:
                raise ResourceExists
        hosts = ca.get("hosts", [])
        if admin_name:
            ca_body.update({"admin_name": admin_name})
        if admin_password:
            ca_body.update({"admin_password": admin_password})
        fabric_ca = FabricCA(**ca_body, hosts=hosts, type=ca_server_type)
        fabric_ca.save()

        return fabric_ca

    def _save_fabric_peer(self, request, peer=None):
        if peer is None:
            return None
        name = peer.get("name")
        gossip_use_leader_reflection = peer.get("gossip_use_leader_reflection")
        gossip_org_leader = peer.get("gossip_org_leader")
        gossip_skip_handshake = peer.get("gossip_skip_handshake")
        local_msp_id = peer.get("local_msp_id")
        ca_nodes = peer.get("ca_nodes")

        body = {"name": name, "local_msp_id": local_msp_id}
        if gossip_use_leader_reflection is not None:
            body.update({"gossip_use_leader_reflection": gossip_use_leader_reflection})
        if gossip_org_leader is not None:
            body.update({"gossip_org_leader": gossip_org_leader})
        if gossip_skip_handshake is not None:
            body.update({"gossip_skip_handshake": gossip_skip_handshake})

        fabric_peer = FabricPeer(**body)
        fabric_peer.save()

        ca_nodes_list = []
        for ca_node in ca_nodes:
            node = ca_node.get("node")
            address = ca_node.get("address")
            certificate = ca_node.get("certificate")
            ca_type = ca_node.get("type")

            ca_body = {"peer": fabric_peer}
            ca_node_dict = {}
            if node is not None:
                ca_body.update({"node": node})
                port = Port.objects.filter(node=node, internal=7054).first()
                if port:
                    ca_node_dict.update(
                        {"address": "%s:%s" % (node.agent.ip, port.external)}
                    )
                ca_node_dict.update(
                    {
                        "type": node.ca.type,
                        "certificate": request.build_absolute_uri(node.file.url),
                    }
                )
            else:
                update_body = {
                    "address": address,
                    "certificate": certificate,
                    "type": ca_type,
                }
                ca_body.update(update_body)
                ca_node_dict.update(update_body)

            peer_ca = PeerCa(**ca_body)
            peer_ca.save()
            users = ca_node.get("users")

            user_list = []
            for ca_user in users:
                ca_user_body = {"peer_ca": peer_ca}
                user_dict = {}
                user = ca_user.get("user")
                username = ca_user.get("username")
                password = ca_user.get("password")
                user_type = ca_user.get("type")

                if user is not None:
                    ca_user_body.update({"user": user})
                    user_dict.update(
                        {
                            "username": user.name,
                            "password": user.secret,
                            "type": user.user_type,
                        }
                    )
                else:
                    update_body = {
                        "username": username,
                        "password": password,
                        "type": user_type,
                    }
                    ca_user_body.update(update_body)
                    user_dict.update(update_body)
                user_list.append(user_dict)

                ca_user_obj = PeerCaUser(**ca_user_body)
                ca_user_obj.save()

            ca_node_dict.update({"users": user_list})

            ca_nodes_list.append(ca_node_dict)

        return fabric_peer, ca_nodes_list

    @swagger_auto_schema(
        request_body=NodeCreateBody,
        responses=with_common_response({status.HTTP_201_CREATED: NodeIDSerializer}),
    )
    def create(self, request, *args, **kwargs):
        """
        Create Node

        :param request: create parameter
        :return: node ID
        :rtype: uuid
        """
        try:
            serializer = NodeCreateBody(data=request.data)
            if serializer.is_valid(raise_exception=True):
                node_name = serializer.validated_data.get("name")
                node_type = serializer.validated_data.get("type")
                num = serializer.validated_data.get("num")
                # organization = request.user.organization
                resource_set_id = request.parser_context["kwargs"].get(
                    "resource_set_id"
                )
                try:
                    resource_set = ResourceSet.objects.get(id=resource_set_id)
                except ResourceSet.DoesNotExist:
                    return Response(
                        err("ResourceSet not found"), status=status.HTTP_400_BAD_REQUEST
                    )
                fabric_resource_set = resource_set.sub_resource_set.get()
                agent = resource_set.agent
                if agent:
                    nodes = Node.objects.filter(
                        name=node_name + "0",
                        fabric_resource_set=fabric_resource_set,
                        type=node_type,
                    )
                    if nodes:
                        raise ResourceExists
                else:
                    raise NoResource
                for n in range(num):
                    name = node_name + str(n)

                    urls = "{}.{}".format(
                        name,
                        (
                            fabric_resource_set.name
                            if node_type == "peer"
                            else fabric_resource_set.name.split(".", 1)[1]
                        ),
                    )
                    nodes = {"type": node_type, "Specs": [name]}

                    # CryptoConfig(organization.name).update(nodes)
                    # CryptoGen(organization.name).extend()
                    # generate core.yml
                    self._generate_config(node_type, fabric_resource_set.name, name)

                    msp, tls, cfg = self._conversion_msp_tls_cfg(
                        node_type, fabric_resource_set.name, name
                    )
                    node = Node(
                        name=name,
                        fabric_resource_set=fabric_resource_set,
                        urls=urls,
                        type=node_type,
                        msp=msp,
                        tls=tls,
                        agent=agent,
                        config_file=cfg,
                    )
                    node.save()
                    # TODO 适配不一样的AGENT
                    add_host(urls)

                    self._set_port(node_type, node, agent)
                    # 加入现有组织的网络？ how could orderer join Change in Network
                    if node.fabric_resource_set.network:
                        try:
                            threading.Thread(
                                target=self._start_node, args=(node.id,)
                            ).start()
                        except Exception as e:
                            raise e

                response = NodeIDSerializer(data=node.__dict__)
                if response.is_valid(raise_exception=True):
                    return Response(
                        ok(response.validated_data), status=status.HTTP_201_CREATED
                    )
        except (ResourceExists, NoResource) as e:
            traceback.print_exc()
            raise e
        except Exception as e:
            traceback.print_exc()
            return Response(err(e.args), status=status.HTTP_400_BAD_REQUEST)

    def _set_port(self, type, node, agent):
        """
        get free port from agent,

        :param type: node type
        :param node: node obj
        :param agent: agent obj
        :return: none
        :rtype: none
        """
        ip = agent.urls.split(":")[1].strip("//")

        if type == "peer":
            ports = find_available_ports(ip, node.id, agent.id, 2)

            set_ports_mapping(
                node.id,
                [
                    {"internal": 7051, "external": ports[0]},
                    {"internal": 7053, "external": ports[1]},
                ],
                True,
            )
        else:
            ports = find_available_ports(ip, node.id, agent.id, 1)
            set_ports_mapping(node.id, [{"internal": 7050, "external": ports[0]}], True)

    def _conversion_msp_tls_cfg(self, type, org, node):
        """
        msp and tls , cfg from zip file to byte

        :param org: organization name
        :param type: node type
        :param node: node name
        :return: msp, tls, cfg
        :rtype: bytes
        """
        try:
            if type == "peer":
                dir_node = "{}/{}/crypto-config/peerOrganizations/{}/peers/{}/".format(
                    CELLO_HOME, org, org, node + "." + org
                )
                name = "core.yaml"
                cname = "peer_config.zip"
            else:
                dir_node = (
                    "{}/{}/crypto-config/ordererOrganizations/{}/orderers/{}/".format(
                        CELLO_HOME,
                        org,
                        org.split(".", 1)[1],
                        node + "." + org.split(".", 1)[1],
                    )
                )
                name = "orderer.yaml"
                cname = "orderer_config.zip"

            zip_dir("{}msp".format(dir_node), "{}msp.zip".format(dir_node))
            with open("{}msp.zip".format(dir_node), "rb") as f_msp:
                msp = base64.b64encode(f_msp.read())

            zip_dir("{}tls".format(dir_node), "{}tls.zip".format(dir_node))
            with open("{}tls.zip".format(dir_node), "rb") as f_tls:
                tls = base64.b64encode(f_tls.read())

            zip_file("{}{}".format(dir_node, name), "{}{}".format(dir_node, cname))
            with open("{}{}".format(dir_node, cname), "rb") as f_cfg:
                cfg = base64.b64encode(f_cfg.read())
        except Exception as e:
            raise e

        return msp, tls, cfg

    def _generate_config(self, type, org, node):
        """
        generate config for node

        :param org: organization name
        :param type: node type
        :param node: node name
        :param port: node port(todo: automatic distribution port)
        :return: none
        :rtype: none
        """
        args = {}
        if type == "peer":
            args.update({"peer_id": "{}.{}".format(node, org)})
            args.update({"peer_address": "{}.{}:{}".format(node, org, 7051)})
            args.update(
                {"peer_gossip_externalEndpoint": "{}.{}:{}".format(node, org, 7051)}
            )
            args.update({"peer_chaincodeAddress": "{}.{}:{}".format(node, org, 7052)})
            args.update({"peer_tls_enabled": True})
            args.update({"peer_localMspId": "{}MSP".format(org.capitalize())})
            a = NodeConfig(org)
            a.peer(node, **args)
        else:
            args.update({"General_ListenPort": 7050})
            args.update({"General_LocalMSPID": "{}OrdererMSP".format(org.capitalize())})
            args.update({"General_TLS_Enabled": True})
            args.update({"General_BootstrapFile": "genesis.block"})

            a = NodeConfig(org)
            a.orderer(node, **args)
        pass

    def _agent_params(self, pk):
        """
        get node's params from db
        :param node: node id
        :return: info
        """
        try:
            node = Node.objects.get(id=pk)
            org = node.fabric_resource_set
            if org is None:
                raise ResourceNotFound
            network = org.network
            if network is None:
                raise ResourceNotFound
            agent = org.agent.get()
            if agent is None:
                raise ResourceNotFound
            ports = Port.objects.filter(node=node)
            if ports is None:
                raise ResourceNotFound

            info = {}
            org_name = org.name if node.type == "peer" else org.name.split(".", 1)[1]
            # get info of node, e.g, tls, msp, config.
            info["status"] = node.status
            info["msp"] = node.msp
            info["tls"] = node.tls
            info["config_file"] = node.config_file
            info["type"] = node.type
            info["name"] = "{}.{}".format(node.name, org_name)
            info["bootstrap_block"] = network.genesisblock
            info["urls"] = agent.urls
            info["network_type"] = network.type
            info["agent_type"] = agent.type
            info["container_name"] = "{}.{}".format(node.name, org_name)
            info["ports"] = ports
            return info
        except Exception as e:
            raise e

    def _start_node(self, pk):
        """
        start node from agent
        :param node: node id
        :return: null
        """
        try:
            node_qs = Node.objects.filter(id=pk)
            infos = self._agent_params(pk)
            agent = AgentHandler(infos)
            cid = agent.create(infos)
            if cid:
                node_qs.update(cid=cid, status="running")
            else:
                raise ResourceNotFound
        except Exception as e:
            raise e

    @swagger_auto_schema(
        methods=["post"],
        request_body=NodeOperationSerializer,
        responses=with_common_response({status.HTTP_202_ACCEPTED: "Accepted"}),
    )
    @action(methods=["post"], detail=True, url_path="operations")
    def operate(self, request, pk=None):
        """
        Operate Node

        Do some operation on node, start/stop/restart
        """
        try:
            serializer = NodeOperationSerializer(data=request.data)
            if serializer.is_valid(raise_exception=True):
                action = serializer.validated_data.get("action")
                infos = self._agent_params(pk)
                agent = AgentHandler(infos)
                node_qs = Node.objects.filter(id=pk)
                node_status = infos.get("status")

                if action == "start" and node_status == "paused":
                    node_qs.update(status="restarting")
                    res = True if agent.start() else False
                    if res:
                        node_qs.update(status="running")
                    return Response(
                        ok({"restart": res}), status=status.HTTP_201_CREATED
                    )
                elif action == "stop" and node_status == "running":
                    res = True if agent.stop() else False
                    if res:
                        node_qs.update(status="paused")
                    return Response(ok({"stop": res}), status=status.HTTP_201_CREATED)
                else:
                    return Response(
                        ok({"error": "invalid operation"}),
                        status=status.HTTP_201_CREATED,
                    )
        except Exception as e:
            return Response(err(e.args), status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        responses=with_common_response({status.HTTP_204_NO_CONTENT: "No Content"})
    )
    def destroy(self, request, pk=None):
        """
        Delete Node

        :param request: destory parameter
        :param pk: primary key
        :return: none
        :rtype: rest_framework.status
        """
        try:
            try:
                node = Node.objects.get(id=pk)
                infos = self._agent_params(pk)
                agent = AgentHandler(infos)
                agent_exist = agent.get()
                node.status = "removing"
                node.save()
                if node.type == "orderer":
                    orderer_cnt = Node.objects.filter(
                        type="orderer",
                        organization__network=node.fabric_resource_set.network,
                    ).count()
                    if orderer_cnt == 1:
                        raise ResourceInUse
                res = False
                # if agent not exist or no continer is created for node, do not try to stop/delete container
                if not agent_exist or not node.cid:
                    res = True
                else:
                    # try to stop/delete container 3 times
                    # TODO: optimize the retry logic
                    for i in range(3):
                        LOG.info("Retry to stop/delete container %d time(s).", i + 1)
                        try:
                            response = agent.stop()
                            if response is not True:
                                LOG.error(
                                    "Failed when agent stops/deletes container: %s",
                                    response,
                                )
                                continue
                            response = agent.delete()
                            if response is not True:
                                LOG.error(
                                    "Failed when agent stops/deletes container: %s",
                                    response,
                                )
                                continue
                            res = True
                        except Exception as e:
                            LOG.error(
                                "Exception when agent stops/deletes container: %s", e
                            )
                            continue
                        break
                if res:
                    fabric_path = "{}/{}".format(FABRIC_NODE, infos["container_name"])
                    if os.path.exists(fabric_path):
                        shutil.rmtree(fabric_path, True)
                    prod_path = "{}/{}".format(PRODUCTION_NODE, infos["container_name"])
                    if os.path.exists(prod_path):
                        shutil.rmtree(prod_path, True)
                    node.delete()
                    # node.status = "exited"
                    # node.save()
                else:
                    return Response(
                        ok({"delete": False}), status=status.HTTP_202_ACCEPTED
                    )
            except ObjectDoesNotExist:
                raise ResourceNotFound
            return Response(ok({"delete": True}), status=status.HTTP_202_ACCEPTED)
        except (ResourceNotFound, ResourceInUse) as e:
            raise e
        except Exception as e:
            return Response(err(e.args), status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_id="update node",
        request_body=NodeUpdateBody,
        responses=with_common_response({status.HTTP_202_ACCEPTED: "Accepted"}),
    )
    def update(self, request, pk=None):
        """
        Update Node

        Update special node with id.
        """
        try:
            serializer = NodeUpdateBody(data=request.data)
            if serializer.is_valid(raise_exception=True):
                node_status = serializer.validated_data.get("status")
                ports = serializer.validated_data.get("ports", [])
                try:
                    node = Node.objects.get(id=pk)
                except ObjectDoesNotExist:
                    raise ResourceNotFound

                node.status = node_status
                node.save()

                for port_item in ports:
                    port = Port(
                        external=port_item.get("external"),
                        internal=port_item.get("internal"),
                        node=node,
                    )
                    port.save()

                return Response(status=status.HTTP_202_ACCEPTED)
        except Exception as e:
            return Response(err(e.args), status=status.HTTP_400_BAD_REQUEST)

    # @swagger_auto_schema(
    #     methods=["post"],
    #     request_body=NodeFileCreateSerializer,
    #     responses=with_common_response({status.HTTP_202_ACCEPTED: "Accepted"}),
    # )
    # @action(methods=["post"], detail=True, url_path="files", url_name="files")
    # def upload_files(self, request, pk=None):
    #     """
    #     Upload file to node

    #     Upload related files to node
    #     """
    #     serializer = NodeFileCreateSerializer(data=request.data)
    #     if serializer.is_valid(raise_exception=True):
    #         file = serializer.validated_data.get("file")
    #         try:
    #             node = Node.objects.get(id=pk)
    #         except ObjectDoesNotExist:
    #             raise ResourceNotFound
    #         else:
    #             # delete old file
    #             if node.file:
    #                 node.file.delete()
    #             node.file = file
    #             node.save()

    #     return Response(status=status.HTTP_202_ACCEPTED)

    @swagger_auto_schema(
        responses=with_common_response(
            with_common_response({status.HTTP_200_OK: NodeStatusSerializer})
        )
    )
    def retrieve(self, request, pk=None):
        """
        Get Node information

        Get node detail information.
        """
        try:
            self._validate_organization(request)
            try:
                node = Node.objects.get(id=pk, organization=request.user.organization)
            except ObjectDoesNotExist:
                raise ResourceNotFound
            else:
                # Set file url of node, we only need node status for now
                # if node.file:
                #     node.file = request.build_absolute_uri(node.file.url)
                # ports = Port.objects.filter(node=node)
                # node.links = [
                #     {
                #         "internal_port": port.internal,
                #         "url": "%s:%s" % (node.agent.ip, port.external),
                #     }
                #     for port in ports
                # ]
                response = NodeStatusSerializer(node)
                return Response(ok(data=response.data), status=status.HTTP_200_OK)
        except Exception as e:
            return Response(err(e.args), status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        methods=["get"],
        responses=with_common_response({status.HTTP_200_OK: NodeConfigFileSerializer}),
    )
    @swagger_auto_schema(
        methods=["post"],
        request_body=NodeConfigFileSerializer,
        responses=with_common_response({status.HTTP_202_ACCEPTED: "Accepted"}),
    )
    @action(methods=["get", "post"], detail=True, url_path="config", url_name="config")
    def node_config(self, request, pk=None):
        """
        Download/upload the node config file
        """
        try:
            self._validate_organization(request)
            organization = request.user.organization
            org = organization.name
            try:
                node = Node.objects.get(id=pk, organization=organization)
            except ObjectDoesNotExist:
                raise ResourceNotFound
            # Get file locations based on node type
            if node.type == "peer":
                dir_node = "{}/{}/crypto-config/peerOrganizations/{}/peers/{}/".format(
                    CELLO_HOME, org, org, node.name + "." + org
                )
                cname = "peer_config.zip"
                name = "core.yaml"
            else:
                dir_node = (
                    "{}/{}/crypto-config/ordererOrganizations/{}/orderers/{}/".format(
                        CELLO_HOME,
                        org,
                        org.split(".", 1)[1],
                        node.name + "." + org.split(".", 1)[1],
                    )
                )
                cname = "orderer_config.zip"
                name = "orderer.yaml"
        except Exception as e:
            return Response(err(e.args), status=status.HTTP_400_BAD_REQUEST)
        if request.method == "GET":
            # Get the config file from local storage
            try:
                config_file = open("{}{}".format(dir_node, cname), "rb")
                response = HttpResponse(config_file, content_type="application/zip")
                response["Content-Disposition"] = "attachment; filename={}".format(
                    cname
                )
                return response
            except Exception as e:
                raise e
        elif request.method == "POST":
            # Update yaml, zip files, and the database field
            try:
                new_config_file = request.data["file"]
                try:
                    yaml.safe_load(new_config_file)
                except yaml.YAMLError:
                    return Response(
                        err("Unable to parse this YAML file."),
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                if os.path.exists("{}{}".format(dir_node, name)):
                    os.remove("{}{}".format(dir_node, name))
                with open("{}{}".format(dir_node, name), "wb+") as f:
                    for chunk in new_config_file.chunks():
                        f.write(chunk)
                if os.path.exists("{}{}".format(dir_node, cname)):
                    os.remove("{}{}".format(dir_node, cname))
                zip_file("{}{}".format(dir_node, name), "{}{}".format(dir_node, cname))
                with open("{}{}".format(dir_node, cname), "rb") as f_cfg:
                    cfg = base64.b64encode(f_cfg.read())
                node.config_file = cfg
                node.save()
                infos = self._agent_params(pk)
                agent = AgentHandler(infos)
                agent.update_config(cfg, node.type)
                return Response(status=status.HTTP_202_ACCEPTED)
            except Exception as e:
                raise e

    @action(methods=["post"], detail=True, url_path="block", url_name="block")
    def block_file(self, request, pk=None):
        """
        Peer join channel by uploading a genesis block file
        """
        try:
            self._validate_organization(request)
            organization = request.user.organization
            org = organization.name
            try:
                node = Node.objects.get(id=pk, organization=organization)
            except ObjectDoesNotExist:
                raise ResourceNotFound
            envs = init_env_vars(node, organization)
            block_path = (
                "{}/{}/crypto-config/peerOrganizations/{}/peers/{}/{}.block".format(
                    CELLO_HOME, org, org, node.name + "." + org, "channel"
                )
            )
            uploaded_block_file = request.data["file"]
            with open(block_path, "wb+") as f:
                for chunk in uploaded_block_file.chunks():
                    f.write(chunk)
            join_peers(envs, block_path)
            os.remove(block_path)
            return Response(status=status.HTTP_202_ACCEPTED)
        except Exception as e:
            return Response(err(e.args), status=status.HTTP_400_BAD_REQUEST)

    def _register_user(self, request, pk=None):
        serializer = NodeUserCreateSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            name = serializer.validated_data.get("name")
            secret = serializer.validated_data.get("secret")
            user_type = serializer.validated_data.get("user_type")
            attrs = serializer.validated_data.get("attrs", "")
            try:
                node = Node.objects.get(id=pk, organization=request.user.organization)
                # Name is unique for each node
                user_count = NodeUser.objects.filter(node=node, name=name).count()
                if user_count > 0:
                    raise ResourceExists
            except ObjectDoesNotExist:
                raise ResourceNotFound

            node_user = NodeUser(
                name=name,
                secret=secret,
                user_type=user_type,
                attrs=attrs,
                node=node,
            )
            node_user.save()

            agent_config_file = request.build_absolute_uri(node.agent.config_file.url)
            node_file_url = request.build_absolute_uri(node.file.url)
            user_patch_url = self.reverse_action(
                "patch-user", kwargs={"pk": pk, "user_pk": node_user.id}
            )
            user_patch_url = request.build_absolute_uri(user_patch_url)
            operate_node.delay(
                str(node.id),
                AgentOperation.FabricCARegister.value,
                agent_config_file=agent_config_file,
                node_file_url=node_file_url,
                user_patch_url=user_patch_url,
                fabric_ca_user={
                    "name": name,
                    "secret": secret,
                    "type": user_type,
                    "attrs": attrs,
                },
            )
            response = NodeUserIDSerializer(node_user)
            return Response(data=response.data, status=status.HTTP_201_CREATED)

    def _list_user(self, request, pk=None):
        serializer = NodeUserQuerySerializer(data=request.GET)
        if serializer.is_valid(raise_exception=True):
            page = serializer.validated_data.get("page")
            per_page = serializer.validated_data.get("per_page")
            name = serializer.validated_data.get("name")
            user_type = serializer.validated_data.get("user_type")
            user_status = serializer.validated_data.get("status")
            query_param = {"node__id": pk}
            if name is not None:
                query_param.update({"name__icontains": name})
            if user_type is not None:
                query_param.update({"user_type": user_type})
            if user_status is not None:
                query_param.update({"status": user_status})

            users = NodeUser.objects.filter(**query_param)
            p = Paginator(users, per_page)
            users = p.page(page)

            response = NodeUserListSerializer({"data": users, "total": p.count})
            return Response(ok(response.data), status=status.HTTP_200_OK)

    @swagger_auto_schema(
        methods=["post"],
        operation_description="Register user to node",
        operation_summary="Register user to node",
        request_body=NodeUserCreateSerializer,
        responses=with_common_response({status.HTTP_201_CREATED: NodeUserIDSerializer}),
    )
    @swagger_auto_schema(
        methods=["get"],
        operation_description="List user of node",
        operation_summary="List user of node",
        query_serializer=NodeUserQuerySerializer,
        responses=with_common_response({status.HTTP_200_OK: NodeUserListSerializer}),
    )
    @action(
        methods=["post", "get"],
        detail=True,
        url_path="users",
        url_name="users",
    )
    def users(self, request, pk=None):
        if request.method == "POST":
            return self._register_user(request, pk)
        elif request.method == "GET":
            return self._list_user(request, pk)

    @swagger_auto_schema(
        methods=["patch"],
        request_body=NodeUserPatchSerializer,
        responses=with_common_response({status.HTTP_202_ACCEPTED: "Accepted"}),
    )
    @action(
        methods=["patch"],
        detail=True,
        url_path="users/(?P<user_pk>[^/.]+)",
        url_name="patch-user",
    )
    def patch_user(self, request, pk=None, user_pk=None):
        """
        Patch user status for node

        Patch user status for node
        """
        try:
            serializer = NodeUserPatchSerializer(data=request.data)
            if serializer.is_valid(raise_exception=True):
                try:
                    node_user = NodeUser.objects.get(id=user_pk, node__id=pk)
                except ObjectDoesNotExist:
                    raise ResourceNotFound

                node_user.status = serializer.validated_data.get("status")
                node_user.save()

                return Response(status=status.HTTP_202_ACCEPTED)
        except Exception as e:
            return Response(err(e.args), status=status.HTTP_400_BAD_REQUEST)

        # # CCP FILE GENERATE

        # @action(
        #     methods=["get"],
        #     detail=True,
        #     url_path="cpp/(?P<pk>[^/.]+)",
        #     url_name="cpp",
        # )
        # def export_cpp(
        #     self,
        #     request,
        #     pk=None,
        # ):
        #     """
        #     Export cpp file for node

        #     Export cpp file for node
        #     """
        #     try:
        #         try:
        #             node = Node.objects.get(id=pk)
        #         except ObjectDoesNotExist:
        #             raise ResourceNotFound
        #         else:
        #             # generate ccp file here

        #             return Response(ok(data=response.data), status=status.HTTP_200_OK)
        #     except Exception as e:
        #         return Response(
        #             err(e.args), status=status.HTTP_400_BAD_REQUEST
        # )

        # def _generate_ccp_file(node_id, user_id):
        #     """
        #         generate ccp file for node
        #     """
