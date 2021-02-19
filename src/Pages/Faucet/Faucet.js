import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Section, Content, Wrapper, Sprite, PopupNote } from 'Components';
import { useFaucet } from 'redux/hooks';
import { bech32 } from 'bech32';
import { breakpoints } from 'consts';

const rotate = keyframes`
  0% {
    transform: rotate3d(0);
  }
  50% {
    transform: rotate3d(0, 1, 0, 180deg);
  }
  100% {
    transform: rotate3d(0);
  }
`;

const FaucetContainer = styled.div`
  display: flex;
  width: 500px;
  max-width: 100%;
  flex-wrap: wrap;
  padding: 40px 0 30px 0;
  @media ${breakpoints.down('md')} {
    width: auto;
  }
`;
const Title = styled.div`
  font-size: 2.4rem;
  font-weight: ${({ theme }) => theme.FONT_WEIGHT_BOLD};
  margin: 10px 0 30px 0;
  text-align: center;
  flex-basis: 100%;
`;
const InfoIconContainer = styled.div`
  position: absolute;
  right: 20px;
  top: 20px;
  text-align: left;
  display: block;
  z-index: 100;
`;
const FaucetIconContainer = styled.div`
  flex-basis: 100%;
  text-align: center;
`;
const FaucetIconHolder = styled.div`
  position: relative;
  margin: auto;
  height: 200px;
  width: 200px;
`;
const FaucetIcon = styled(Sprite)`
  animation: ${rotate} 2s linear infinite forwards;
  position: absolute;
  &:nth-child(1) {
    right: 2px;
    animation-duration: 20000ms;
  }
  &:nth-child(2) {
    right: 4px;
    opacity: 0.2;
    animation-duration: 20200ms;
  }
  &:nth-child(3) {
    right: 6px;
    opacity: 0.15;
    animation-duration: 20400ms;
  }
  &:nth-child(4) {
    right: 8px;
    opacity: 0.1;
    animation-duration: 20600ms;
  }
  &:nth-child(5) {
    right: 10px;
    opacity: 0.05;
    animation-duration: 20800ms;
  }
`;
const ErrorText = styled.div`
  font-size: 1.4rem;
  color: ${({ theme }) => theme.FONT_ERROR};
  position: absolute;
  top: -20px;
  left: 10px;
`;
const TextInputContainer = styled.div`
  display: flex;
  position: relative;
  flex-wrap: wrap;
  max-width: 100%;
  width: 100%;
  @media ${breakpoints.down('md')} {
    justify-content: center;
  }
`;
const TextInput = styled.input`
  background-color: ${({ theme }) => theme.INPUT_BG_LIGHT};
  color: ${({ theme }) => theme.INPUT_FONT_LIGHT};
  border: 1px solid ${({ theme }) => theme.INPUT_BORDER_LIGHT};
  border-radius: 4px;
  padding: 6px 10px;
  min-width: 300px;
  font-size: 1.4rem;
  line-height: 2.2rem;
  margin-right: 20px;
  margin-bottom: 10px;
  &:disabled {
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.INPUT_DISABLED};
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 1px 1px ${({ theme }) => theme.INPUT_OUTLINE_LIGHT};
  }
  &::placeholder {
    color: ${({ theme }) => theme.INPUT_PLACEHOLDER_LIGHT};
  }
  @media ${breakpoints.down('md')} {
    flex-basis: 100%;
    min-width: auto;
    margin-right: 0;
  }
`;
const SubmitButton = styled.button`
  text-align: left;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.BUTTON_PRIMARY_FONT};
  background: ${({ theme }) => theme.BUTTON_PRIMARY};
  border-radius: 5px;
  border: 1px solid ${({ theme }) => theme.BUTTON_PRIMARY};
  padding: 6px 12px;
  border: none;
  margin-bottom: 10px;
  cursor: pointer;
  &:focus {
    background: ${({ disabled, theme }) => !disabled && theme.BUTTON_PRIMARY_FOCUS};
  }
  &:hover {
    background: ${({ disabled, theme }) => !disabled && theme.BUTTON_PRIMARY_HOVER};
  }
  &:active {
    background: ${({ disabled, theme }) => !disabled && theme.BUTTON_PRIMARY_ACTIVE};
  }
  ${({ disabled, theme }) =>
    disabled &&
    `
    background: ${theme.BUTTON_DISABLED};
    cursor: not-allowed;
  `}
  @media ${breakpoints.down('md')} {
    flex-basis: 100%;
    text-align: center;
    justify-content: center;
  }
`;
const ButtonText = styled.span`
  font-size: 1.4rem;
  min-width: 93px;
`;
const ButtonIcon = styled.div`
  margin-left: 4px;
  display: flex;
`;
const ServerResponse = styled.div`
  font-size: 1.5rem;
  margin-top: 8px;
  font-weight: ${({ theme }) => theme.FONT_WEIGHT_NORMAL};
  font-style: italic;
`;

const Faucet = () => {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [timeoutDuration, setTimeoutDuration] = useState(10000);
  const [showPopup, setShowPopup] = useState(false);
  const { sendFaucetAddress, faucetRequestStatus } = useFaucet();
  const timeoutActive = timeoutDuration > 0;

  const interperetServerResponse = () => {
    // No response yet/default value
    if (faucetRequestStatus === 'success') return 'Successfully added nhash to address!';
    // Look at faucetRequestResponse and determine what to tell the user
    if (faucetRequestStatus === 'failure') return 'Server error, try again later.';
    return null;
  };
  const serverResponse = interperetServerResponse();

  // On load, start timer before submit allowed
  useEffect(() => {
    let timer = '';
    // start timer if needed
    if (timeoutActive) {
      // wait 1s, then change timeout duration
      timer = setTimeout(() => {
        const newDuration = timeoutDuration - 1000;
        setTimeoutDuration(newDuration);
      }, 1000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [timeoutActive, timeoutDuration]);

  const addressValidation = () => {
    // Test - submit timer allows submitting
    if (timeoutDuration > 0) return 'Please wait for Token Timeout';
    // make sure address is valid
    // Test - value exists
    if (!address) return 'Address missing';
    // Test - check for any spaces
    if (address.includes(' ')) return 'Address cannot contain spaces';
    // Test - check for any special characters
    if (/[~`!#$%^&*+=\-[\]\\';,/{}|\\":<>?]/g.test(address)) return 'Address cannot contain special characters';
    // Test the address to make sure it's a valid bech32 address within our test network
    try {
      // Test - Is address Bech32
      const { prefix, words } = bech32.decode(address);
      // Test - Is address within testnet
      if (prefix !== 'tp') return 'Only Testnet addresses allowed';
      // Test - Is address valid 32 length
      if (words.length !== 32) return 'Address is invalid';
    } catch (error) {
      return `${error}`;
    }

    return 'pass';
  };
  const submitAddress = () => {
    // Clear out any previous errors
    if (error) {
      setError('');
    }
    // Check the status of the input address value
    const addressStatus = addressValidation();

    if (addressStatus === 'pass') {
      // Address is valid, submit
      sendFaucetAddress({ address });
      // Set timeout back to 10s
      setTimeoutDuration(10000);
    } else {
      // Address not valid, set error
      setError(addressStatus);
    }
  };
  const editAddress = ({ target }) => {
    // Clear out any previous errors
    if (error) {
      setError('');
    }
    setAddress(target?.value || '');
  };

  return (
    <Wrapper>
      <Section>
        <Content justify="center">
          <InfoIconContainer>
            <Sprite
              icon="HELP"
              size="2.2rem"
              onClick={() => setShowPopup(!showPopup)}
              onMouseEnter={() => setShowPopup(true)}
              onMouseLeave={() => setShowPopup(false)}
            />
            <PopupNote show={showPopup} position="left" minWidth="220px">
              Each request disburses 10nhash, any account can only get max of 10,000nhash.
            </PopupNote>
          </InfoIconContainer>
          <FaucetContainer>
            <FaucetIconContainer>
              <FaucetIconHolder>
                <FaucetIcon icon="HASH" size="20rem" />
                <FaucetIcon icon="HASH" size="20rem" />
                <FaucetIcon icon="HASH" size="20rem" />
                <FaucetIcon icon="HASH" size="20rem" />
                <FaucetIcon icon="HASH" size="20rem" />
              </FaucetIconHolder>
            </FaucetIconContainer>
            <Title>Provenance Explorer Faucet</Title>
            <TextInputContainer>
              {error && <ErrorText>{error}</ErrorText>}
              <TextInput
                disabled={timeoutActive}
                onChange={editAddress}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    submitAddress();
                  }
                }}
                placeholder={timeoutActive ? 'Please wait for timeout' : 'Enter Address'}
                value={address}
              />
              <SubmitButton
                disabled={timeoutActive}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !timeoutActive) {
                    submitAddress();
                  }
                }}
                onClick={submitAddress}
              >
                <ButtonText>{timeoutActive ? `Timeout (${timeoutDuration / 1000}s)` : 'Get Tokens'}</ButtonText>
                <ButtonIcon>
                  <Sprite icon="CUBES" size="2.2rem" color="ICON_WHITE" />
                </ButtonIcon>
              </SubmitButton>
            </TextInputContainer>
            {serverResponse && <ServerResponse>{serverResponse}</ServerResponse>}
          </FaucetContainer>
        </Content>
      </Section>
    </Wrapper>
  );
};

export default Faucet;
