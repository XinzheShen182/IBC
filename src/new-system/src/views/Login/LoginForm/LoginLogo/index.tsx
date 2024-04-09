import React from 'react';
import styled from 'styled-components';

const Title = styled.h1`
    text-align: center;
    margin-top: 50px;
    font-size: 3rem;
    color: #2980b9; /* 蓝色 */
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); 
    font-family: 'Arial', sans-serif; 
`;

const LoginTitle: React.FC = () => {
    return (
        <Title>
            Chain For Future
        </Title>
    );
};

export default LoginTitle;
