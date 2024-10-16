#!/bin/sh

# Should run with sudo

# Remove Storage

echo "Remove Storage"

rm -rf ./agent/docker-rest-agent/storage/*

echo "Remove Fabric CA storage"

rm -rf ./agent/docker-rest-agent/CA_related/storage/fabric-ca-servers/*

# Remove opt/cello

echo "Remove opt/cello"

rm -rf ./backend/opt/cello/*

# Remove opt/chaincode

# Remove pgdata


echo "Remove pgdata"
chmod -R 777 ./backend/pgdata
rm -rf ./backend/pgdata/*

# rm -rf /home/logres/LoLeido/cello/src/backend/opt/chaincode/*

echo "Remove py migrations"
find ./backend/api/migrations -type f -name '*_auto_*.py' -exec rm -f {} \;

# Remove Container
#!/bin/bash

# 停止和删除以cello.com、edu.cn或tech.cn结尾的Docker容器
docker ps -a --format "{{.Names}}" | grep -E 'com$|edu.cn$|tech.cn$|org.com$' | while read -r container_name
do
    echo "Stopping and removing container: $container_name"
    docker stop "$container_name" && docker rm "$container_name"
done


echo "Remove DB"
docker stop cello-postgres
docker rm cello-postgres

# input y
docker container prune -f
docker volume prune -f

# Remove Firefly

echo "Remove Firefly"
rm -rf /home/logres/.firefly/stacks/cello_*