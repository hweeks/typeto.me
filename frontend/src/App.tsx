import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import styled from "styled-components";
import { ConnectToRoom } from "./components/ConnectToRoom";
import { store } from "./state";

const Title = styled.h1`
  font-family: fantasy;
`;

export const AppRoot = () => (
  <Provider store={store}>
    <Title>typeto.me</Title>
    <Router>
      <Switch>
        <Route path="/">
          <ConnectToRoom />
        </Route>
      </Switch>
    </Router>
  </Provider>
);

export default AppRoot;
