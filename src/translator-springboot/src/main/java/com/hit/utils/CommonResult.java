package com.hit.utils;


import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.hit.utils.CommonResultSerializer;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;


@JsonSerialize(using = CommonResultSerializer.class)
@ApiModel(description = "The common result of API")
public class CommonResult<T> {
    public static final String CODE = "code";
    public static final String MESSAGE = "message";
    public static final String DATA = "data";
    @ApiModelProperty(value = "HTTP status code")
    private int code;
    @ApiModelProperty(value = "HTTP status message")
    private String message;
    @ApiModelProperty(value = "Data of the API result")
    private T data;
    @ApiModelProperty(value = "Additional Data of the result", hidden = true)
    private Map<String, Object> resultMap = new HashMap<>();


    public CommonResult<T> code(HttpStatus status) {
        this.code = status.value();
        return this;
    }

    public CommonResult<T> code(Integer code){
        this.code = code;
        return this;
    }

    public CommonResult<T> message(String message) {
        this.message = message;
        return this;
    }

    public CommonResult<T> data(T data) {
        this.data = data;
        return this;
    }

    public CommonResult<T> success() {
        this.code(HttpStatus.OK);
        this.message(HttpStatus.OK.getReasonPhrase());
        return this;
    }

    public CommonResult<T> fail() {
        this.code(HttpStatus.INTERNAL_SERVER_ERROR);
        this.message(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase());
        return this;
    }


    public CommonResult<T> put(String key, Object value) {
        resultMap.put(key, value);
        return this;
    }

    public Object get(String key) {
        if (CODE.equals(key)) {
            return code;
        }
        if (MESSAGE.equals(key)) {
            return message;
        }
        if (DATA.equals(key)) {
            return data;
        }
        return resultMap.get(key);
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public Map<String, Object> getResultMap() {
        return resultMap;
    }

    public void setResultMap(Map<String, Object> resultMap) {
        this.resultMap = resultMap;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        CommonResult<?> that = (CommonResult<?>) o;
        return code == that.code && Objects.equals(message, that.message) && Objects.equals(data, that.data) && Objects.equals(resultMap, that.resultMap);
    }

    @Override
    public int hashCode() {
        return Objects.hash(code, message, data, resultMap);
    }
}
