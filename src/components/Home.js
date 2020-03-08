import React from "react";

import {
  makeStyles,
  TextField,
  FormControl,
  OutlinedInput,
  InputLabel,
  InputAdornment,
  IconButton,
  Button,
  CircularProgress,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@material-ui/core";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

import { Fade } from "react-reveal";

import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore"

import LessonCard from "./LessonCard";

import { capitalizeFirstLetter } from "../model/utils";

const useStyles = makeStyles(theme => ({
  center: {
    justifyContent: "center",
    textAlign: "center"
  },
  rectangle: {
    padding: 2,
    borderRadius: 10,
    color: "#000",
    background: "#FFF",
    width: 300,
    paddingBottom: 15,
  },
  cardContainer: {
    display: "flex",
    flexDirection: "row"
  },
  buttons: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly"
  },
  pageTitle: {
    margin: 20,
    fontWeight: "normal",
  }
}));

export default function Welcome(props) {
  const db = firebase.firestore();

  const classes = useStyles();

  const [values, setValues] = props.values;

  const [cards, setCards] = props.cards;

  const [err, setError] = React.useState({
    name: false,
    password: false
  });

  const [openDialog, setOpenDialog] = React.useState(false);

  const handleRegister = () => {
    setOpenDialog(true);
  };

  const handleDialogCloseCancel = () => {
    setOpenDialog(false);
  };
  const handleDialogCloseConfirm = () => {
    setOpenDialog(false);

    setValues({ ...values, fetching: true });

    
  };

  const handleChange = prop => event => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = event => {
    event.preventDefault();
  };

  const handleLog = () => {
    setValues({ ...values, fetching: true });
    setError({
      name: false,
      password: false
    });

    firebase
      .auth()
      .signInWithEmailAndPassword(values.login, values.password)
      .then(() => {
        setValues({ ...values, fetching: false });
        db.collection("users").doc("4GYEMfS0bfNm8zAqBgN5").get().then((snap) => {
          const val = snap.data()[values.login]
          setValues({...values, user : val})
          createSubjects(values.user)
        })
      })
      .catch((err) => {
        setError({
          name: true,
          password: true
        });
      });
  };

  const createSubjects = user => {
    setCards({ ...cards, fetching: true });
    const defaultLanguage =
      user.languages !== undefined ? Object.keys(user.languages)[0] : "french";
    
  };

  return (
    <div className={classes.center}>
      {values.user ? (
        <div>
          <Typography variant="h3" color="secondary">
            Welcome {values.user.name} !
          </Typography>
          <Fade bottom>
            <Typography variant="h4" color="secondary">
              {capitalizeFirstLetter(
                values.user.languages !== undefined
                  ? Object.keys(values.user.languages)[0]
                  : "french"
              )}
            </Typography>
            <div className={classes.cardContainer}>
              {cards.fetching ? <CircularProgress /> : cards.list}
            </div>
          </Fade>
        </div>
      ) : (
        <div>
          <Typography
            variant="h3"
            color="secondary"
            className={classes.pageTitle}
          >
            Login
          </Typography>
          <div className={classes.rectangle}>
            <div>
              <h3>Please enter your credentials</h3>
              <FormControl noValidate autoComplete="on">
                <TextField
                  variant="outlined"
                  id="userName"
                  error={err.name}
                  label="User Name"
                  style={{ marginBottom: 15, width: 215 }}
                  value={values.login}
                  onChange={handleChange("login")}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleLog();
                  }}
                />
              </FormControl>
              <FormControl
                noValidate
                variant="outlined"
                autoComplete="on"
                style={{ marginBottom: 15 }}
              >
                <InputLabel htmlFor="password">Password</InputLabel>
                <OutlinedInput
                  id="password"
                  error={err.password}
                  style={{ width: 215 }}
                  type={values.showPassword ? "text" : "password"}
                  value={values.password}
                  onChange={handleChange("password")}
                  label="Password"
                  onKeyDown={e => {
                    if (e.key === "Enter") handleLog();
                  }}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                      >
                        {values.showPassword ? (
                          <Visibility />
                        ) : (
                          <VisibilityOff />
                        )}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>
              <br />
              {values.fetching ? (
                <CircularProgress />
              ) : (
                <div className={classes.buttons}>
                  <FormControl>
                    <Button onClick={handleLog}>Login</Button>
                  </FormControl>
                  <Typography variant="h6" style={{ fontSize: 15 }}>
                    OR
                  </Typography>
                  <FormControl>
                    <Button onClick={handleRegister}>Register</Button>
                  </FormControl>
                </div>
              )}
            </div>
          </div>
          <Dialog
            open={openDialog}
            onClose={handleDialogCloseCancel}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">Register</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Do you confirm to create this account ?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogCloseCancel} color="primary">
                Disagree
              </Button>
              <Button
                onClick={handleDialogCloseConfirm}
                color="primary"
                autoFocus
              >
                Agree
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
    </div>
  );
}
