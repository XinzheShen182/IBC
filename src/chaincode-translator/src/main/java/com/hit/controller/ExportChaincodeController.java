package com.hit.controller;

import com.hit.translator.Choreography;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.util.ArrayList;
import java.io.FileWriter;
import java.io.File;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/chaincode")
@Api(value = "operate chaincode", tags = "chaincode")
public class ExportChaincodeController {
    @PostMapping("/generate")
    @ApiOperation("generate chaincode from a file you import")
    public ResponseEntity<Map<String, String>> generateChaincode(@RequestBody Map<String, String> requestBody) {
        Choreography choreography = new Choreography();
        File tempFile = null;
        FileWriter writer = null;

        try {
            tempFile = File.createTempFile("tempfile", ".bpmn");
            writer = new FileWriter(tempFile);

            String bpmnContent = requestBody.get("bpmnContent");
            String participantMspMap = requestBody.get("participantMspMap");

            System.out.println("Parameter bpmnContent: " + bpmnContent);

            writer.write(bpmnContent);
            writer.close();
            // record time cost and return it
            long startTime = System.currentTimeMillis();
            choreography.startExport(tempFile,participantMspMap);// 没有输出file
            long endTime = System.currentTimeMillis();
            long timeCost = endTime - startTime;
            System.out.println("File created: " + choreography.ffiJsonFile);
            String choreographyFileContent = new String(choreography.choreographyFile);
            String ffiJsonFileContent = new String(choreography.ffiJsonFile);
            Map<String, String> responseMap = new HashMap<>();
            responseMap.put("bpmnContent", choreographyFileContent);
            responseMap.put("ffiContent", ffiJsonFileContent);
            responseMap.put("timeCost", String.valueOf(timeCost));

            choreography.ffiJsonFile = "";

            return ResponseEntity.ok()
                    .body(responseMap);


        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

    }

    @PostMapping("/getPartByBpmnC")
    @ApiOperation("get participant by bpmncontext")
    public ResponseEntity<Map<String,String>> getPartByBpmnC(@RequestBody Map<String, String> requestBody) {
        Choreography choreography = new Choreography();
        File tempFile = null;
        FileWriter writer = null;

        try {
            tempFile = File.createTempFile("tempfile", ".bpmn");
            writer = new FileWriter(tempFile);

            String bpmnContent = requestBody.get("bpmnContent");
            System.out.println("Parameter bpmnContent: " + bpmnContent);

            writer.write(bpmnContent);
            writer.close();
            choreography.readFile(tempFile);
            choreography.getParticipants();
            System.out
                    .println(choreography.participantsWithoutDuplicates + "choreography.participantsWithoutDuplicates"); // 参与方名称

            Map<String,String> part=choreography.getParticipantIdName();
            // 参与方id

            return new ResponseEntity<>(part, HttpStatus.OK);

        } catch (IOException e) {
            throw new RuntimeException(e);
        }

    }

    @GetMapping("/generatetest")
    @ApiOperation("generate chaincode locally")
    public void generateChaincodeTest() {
        File bpmnFile = new File("src/main/java/com/hit/example/parallel.bpmn");
        BufferedReader reader = null;

        try {
            reader = new BufferedReader(new FileReader(bpmnFile));
            String line;
            while ((line = reader.readLine()) != null) {
                // System.out.println(line);
            }
            Choreography choreography = new Choreography();
            choreography.start(bpmnFile, "");

            FileWriter wChor = new FileWriter(new File("src/main/java/com/hit/example/ffijson.json"));
            BufferedWriter bChor = new BufferedWriter(wChor);
            System.out.println("Is ffiJsonFile valid json file?" + Choreography.isValidJson(choreography.ffiJsonFile));
            bChor.write(choreography.ffiJsonFile);
            bChor.flush();
            bChor.close();

            choreography.ffiJsonFile = "";

            // 打印 gatewayGuards
            System.out.println("gatewayGuards:");
            for (String guard : choreography.gatewayGuards) {
                System.out.println(guard);
            }

            // 打印 messageParasMap
            System.out.println("\nmessageParasMap:");
            for (Map.Entry<String, String> entry : choreography.messageParasMap.entrySet()) {
                System.out.println(entry.getKey() + " : " + entry.getValue());
            }

            // 打印 gatewayMemoryParams
            System.out.println("\ngatewayMemoryParams:");
            for (String param : choreography.gatewayMemoryParams) {
                System.out.println(param);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

    }

    private byte[] serialize(Object object) throws IOException {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        ObjectOutputStream oos = new ObjectOutputStream(bos);
        oos.writeObject(object);
        oos.flush();
        return bos.toByteArray();
    }

}

class ChaincodeGenerationResponse {
    private byte[] fileContent;
    private byte[] choreographyFFIContent;

    public ChaincodeGenerationResponse(byte[] fileContent, byte[] choreographyFFIContent) {
        this.fileContent = fileContent;
        this.choreographyFFIContent = choreographyFFIContent;
    }

    public byte[] getFileContent() {
        return fileContent;
    }

    public byte[] getChoreographyFFIContent() {
        return choreographyFFIContent;
    }
}
