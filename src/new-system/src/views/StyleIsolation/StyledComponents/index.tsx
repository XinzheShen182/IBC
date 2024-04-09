import styled from "styled-components";

const Box = styled.div`
  color: blueviolet;
`;


const StyleIsolation = (props: any) => {
  return (
    <Box>
      <span>我是传进来的数据 {props.type}</span>
    </Box>
  );
};

export default StyleIsolation;
