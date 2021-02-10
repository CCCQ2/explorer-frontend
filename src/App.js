import React from 'react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { useApp } from 'redux/hooks';
import { Navigation, Footer, SpriteSheet, BaseStyle } from 'Components';
import { GlobalStyle, Themes } from 'theme';
import { Block, Blocks, Dashboard, NoMatch404, Tx, Txs, Validator, Validators, Accounts, Assets, Asset } from './Pages';

const App = () => {
  const { theme } = useApp();
  const activeTheme = Themes[theme] || Themes.default;

  return (
    <BrowserRouter basename={process.env.PUBLIC_URL || ''}>
      <>
        <GlobalStyle theme={activeTheme} />
        <SpriteSheet />
        <ThemeProvider theme={activeTheme}>
          <BaseStyle>
            <Navigation />
            <Switch>
              <Route exact path="/">
                <Redirect to="/dashboard" />
              </Route>
              <Route exact path="/dashboard" component={Dashboard} />
              <Route path="/block/:blockHeight" component={Block} />
              <Route path="/blocks" component={Blocks} />
              <Route path="/tx/:txHash" component={Tx} />
              <Route path="/txs" component={Txs} />
              <Route path="/validator/:validatorId" component={Validator} />
              <Route path="/validators" component={Validators} />
              <Route path="/accounts/:addressId" component={Accounts} />
              <Route path="/assets" component={Assets} />
              <Route path="/asset/:assetId" component={Asset} />
              <Route component={NoMatch404} />
            </Switch>
            <Footer />
          </BaseStyle>
        </ThemeProvider>
      </>
    </BrowserRouter>
  );
};

export default App;
