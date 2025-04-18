import { FormInput, SubmitBtn } from '../components';
import { ActionFunctionArgs, Form, Link, redirect } from 'react-router-dom';
import styled from 'styled-components';
import { customFetch } from '../utils';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

const Container = styled.section`
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FormContainer = styled(Form)`
  width: 24rem;
  padding: 2rem;
  background-color: #1a1a1a;
  border: 2px solid #333;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Title = styled.h4`
  text-align: center;
  font-size: 1.875rem;
  font-weight: bold;
  font-family: 'Press Start 2P', cursive;
  color: #fff;
  margin-bottom: 1rem;
`;

const ButtonContainer = styled.div`
  margin-top: 1rem;
`;

const LinkContainer = styled.p`
  text-align: center;
  font-family: 'Press Start 2P', cursive;
  font-size: 12px;
  color: #fff;
  margin-top: 1rem;
`;

const StyledLink = styled(Link)`
  margin-left: 0.5rem;
  color: #646cff;
  text-decoration: none;
  text-transform: capitalize;
  transition: color 0.3s;

  &:hover {
    color: #535bf2;
    text-decoration: underline;
  }
`;

const OrDivider = styled.div`
  display: flex;
  align-items: center;
  margin: 1rem 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #444;
  }

  span {
    margin: 0 1rem;
    font-family: 'Press Start 2P', cursive;
    font-size: 10px;
    color: #888;
  }
`;

const GoogleButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #1a1a1a;
  border: 1px solid #444;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-family: 'Press Start 2P', cursive;
  font-size: 12px;
  transition: all 0.3s;

  &:hover {
    background-color: #333;
  }
`;

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  try {
    const response = await customFetch.post('/user/login', {
      username,
      password,
    });
    if (response.data.token) localStorage.setItem('token', response.data.token);

    toast.success('logged in successfully');
    return redirect('/');
  } catch (error) {
    let errorMessage = 'please double check your credentials';
    if (error instanceof AxiosError && error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }
    toast.error(errorMessage);
    return null;
  }
};

const Login: React.FC = () => {
  return (
    <Container>
      <FormContainer method='post'>
        <Title>Login</Title>
        <FormInput type='text' label='username' name='username' required />
        <FormInput type='password' label='password' name='password' required />
        <ButtonContainer>
          <SubmitBtn text='login' />
        </ButtonContainer>
        <LinkContainer>
          Don't have an account? <StyledLink to='/signup'>signup</StyledLink>
        </LinkContainer>
        <OrDivider>
          <span>OR</span>
        </OrDivider>

        <GoogleButton type='button'>
          <svg
            width='22'
            height='22'
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 48 48'
          >
            <path
              fill='#FFC107'
              d='M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z'
            ></path>
            <path
              fill='#FF3D00'
              d='M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z'
            ></path>
            <path
              fill='#4CAF50'
              d='M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z'
            ></path>
            <path
              fill='#1976D2'
              d='M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z'
            ></path>
          </svg>
          Login with Google
        </GoogleButton>
      </FormContainer>
    </Container>
  );
};

export default Login;
