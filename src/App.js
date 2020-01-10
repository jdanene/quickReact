import 'rbx/index.css';
import { Button, Container, Title, Message } from 'rbx';
import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import CourseList from './components/CourseList';

const firebaseConfig = {
  apiKey: "AIzaSyCqw1xWH81sjnqqCMs_vQ4jCrnddV4ixQo",
  authDomain: "courseschedule-acba5.firebaseapp.com",
  databaseURL: "https://courseschedule-acba5.firebaseio.com",
  projectId: "courseschedule-acba5",
  storageBucket: "courseschedule-acba5.appspot.com",
  messagingSenderId: "197857793704",
  appId: "1:197857793704:web:299b5d8bc444c90f1e149d",
  measurementId: "G-ZYPJM4TNG4",
};
firebase.initializeApp(firebaseConfig);
export const db = firebase.database().ref();

const uiConfig = {
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: () => false
  }
};

const schedule = {
  "title": "CS Courses for 2018-2019",
  "courses": [
    {
      "id": "F101",
      "title": "Computer Science: Concepts, Philosophy, and Connections",
      "meets": "MWF 11:00-11:50"
    },
    {
      "id": "F110",
      "title": "Intro Programming for non-majors",
      "meets": "MWF 10:00-10:50"
    },
    {
      "id": "F111",
      "title": "Fundamentals of Computer Programming I",
      "meets": "MWF 13:00-13:50"
    },
    {
      "id": "F211",
      "title": "Fundamentals of Computer Programming II",
      "meets": "TuTh 12:30-13:50"
    }
  ]
};


const meetsPat = /^ *((?:M|Tu|W|Th|F)+) +(\d\d?):(\d\d) *[ -] *(\d\d?):(\d\d) *$/;




const SignIn = () => (
    <StyledFirebaseAuth
        uiConfig={uiConfig}
        firebaseAuth={firebase.auth()}
    />
);

const Welcome = ({ user }) => (
    <Message color="info">
      <Message.Header>
        Welcome, {user.displayName}
        <Button primary onClick={() => firebase.auth().signOut()}>
          Log out
        </Button>
      </Message.Header>
    </Message>
);

const Banner = ({ user, title }) => (
    <React.Fragment>
      { user ? <Welcome user={ user } /> : <SignIn /> }
      <Title>{ title || '[loading...]' }</Title>
    </React.Fragment>
);





const timeParts = meets => {
  const [match, days, hh1, mm1, hh2, mm2] = meetsPat.exec(meets) || [];
  return !match ? {} : {
    days,
    hours: {
      start: hh1 * 60 + mm1 * 1,
      end: hh2 * 60 + mm2 * 1
    }
  };
};




//project-197857793704

//id
//197857793704-46dam7rv4pl5mhvogud2d9hgrha85emq.apps.googleusercontent.com

//secret
//6eO_N2p0AxLm3xkVjNdy-Trr




const addCourseTimes = course => ({
  ...course,
  ...timeParts(course.meets)
});

const addScheduleTimes = schedule => ({
  title: schedule.title,
  courses: Object.values(schedule.courses).map(addCourseTimes)
});





const App = () => {
  const [schedule, setSchedule] = useState({ title: '', courses: [] });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleData = snap => {
      if (snap.val()) setSchedule(addScheduleTimes(snap.val()));
    };
    db.on('value', handleData, error => alert(error));
    return () => { db.off('value', handleData); };
  }, []);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(setUser);
  }, []);

  return (
      <Container>
        <Banner title={ schedule.title } user={ user } />
        <CourseList courses={ schedule.courses } user={ user } />
      </Container>
  );
};
export default App;