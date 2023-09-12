import React from 'react';
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { changeDate, changeDateSpecifics } from './redux_slices/dateSlice';
import { updateSignIn, updateUid, updatePfp, updateName, updateBio, resetSignIn } from './redux_slices/signInSlice';
import { replaceAll } from './redux_slices/eventSlice';
import { changeAllColors } from './redux_slices/colorSlice';
import createEventsRepeated from './calendar_body_useful_functions/create_repeating_events';
import getHourAndMinutes from './calendar_body_useful_functions/get_hours_and_minutes';
import filterEventsStartEnd from './calendar_body_useful_functions/filter_events_start_end';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

function HeaderToggleSideMenu({menuHidden, setMenuHidden}) {
    const handleHeaderMenuOnClick = () => {
        let menu = document.querySelector('.calendar-menu');
        let body = document.querySelector('.calendar-body-container');
        let addEvent = document.querySelector('.add-event');
        let addEventText = document.querySelector('.add-event-text');
        let menuContainer = document.querySelector('.toggle-header-menu-container')
        if(!menuHidden) {
            menu.style.transform = "translateX(-100%)";
            body.style.left = "0px";
            body.style.width = "100%";
            body.style.transition = "left 0.5s ease-in-out, width 0.5s ease-in-out";
            addEvent.style.left = "10px";
            addEvent.style.top = "80px";
            addEvent.style.width = "40px";
            addEventText.style.display = "none";
            menuContainer.style.pointerEvents = "none";
            setTimeout(() => {
                menuContainer.style.pointerEvents = "";
                body.style.transition = "";
            }, 500)
            setMenuHidden(true);
        } else {
            menu.style.transform = "";
            body.style.left = "";
            body.style.width = "";
            body.style.transition = "left 0.5s ease-in-out, width 0.5s ease-in-out";
            addEvent.style = "";
            addEventText.style = "";
            menuContainer.style.pointerEvents = "none";
            setTimeout(() => {
                body.style = "";
                menuContainer.style.pointerEvents = "";
            }, 500)
            setMenuHidden(false);
        }

    }
    return(
        <div className='toggle-header-menu-container' onClick={() => handleHeaderMenuOnClick()}>
            <div className='toggle-header-menu-line line-fill'></div>
            <div className='toggle-header-menu-line line-fill'></div>
            <div className='toggle-header-menu-line line-fill'></div>
        </div>
    );
}

function HeaderCalendar() {
    return(
        <div className='header-calendar-container'>
            <svg className='svg-fill' xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 0 448 512"><path d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192H400V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192z"/></svg>
            <div className='header-calendar-text'>Calendar</div>
        </div>
    );
}

function HeaderDropdownMenu(props) {

    const [visible, setVisible] = useState(["hidden", 0]);

    const ref = useRef();

    useEffect(() => {
        const HeaderDropdownMenuClicked = (e) => {
            if(visible[0] === "visible" && ref.current && !ref.current.contains(e.target)) {
                setVisible(["hidden", 0])
            }
        }

        document.addEventListener("click", HeaderDropdownMenuClicked);

        return () => {
            document.removeEventListener("click", HeaderDropdownMenuClicked);
        }
    }, [visible]);

    const changeDateSpecificsOnClick = (value) => {
        props.dispatch(changeDateSpecifics(value));
    }

    return(
        <div className='header-dropdown-container'>
            <div className='dropdown-main' onClick={() => visible[0] === "visible" ? setVisible(["hidden", 0]) : setVisible(["visible", 1])} ref={ref}>
                <span>{props.currentDate.specifics[0].toUpperCase() + props.currentDate.specifics.substring(1)}</span>
                <svg className="dropdown-main-down-arrow svg-fill" xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 0 448 512"><path d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>
            </div>
            <div className='header-dropdown-select' style={{"visibility": visible[0], "opacity": visible[1]}}>
                <div className='header-dropdown-select-options' onClick={() => changeDateSpecificsOnClick("day")}>Day</div>
                <div className='header-dropdown-select-options' onClick={() => changeDateSpecificsOnClick("week")}>Week</div>
                <div className='header-dropdown-select-options' onClick={() => changeDateSpecificsOnClick("month")}>Month</div>
                <div className='header-dropdown-select-options' onClick={() => changeDateSpecificsOnClick("year")}>Year</div>
                <div className='header-dropdown-select-options' onClick={() => changeDateSpecificsOnClick("schedule")}>Schedule</div>
            </div>
        </div>
    );
}

function HeaderSignInPopup(props) {
    const auth = getAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [switchbtwn, setSwitchbtwn] = useState("log in");
    const [changingWords, setChangingWords] = useState({extra: "Register", popup: "Log in", title: "Log in"});
    const [errorObj, setErrorObj] = useState({visibility: "visibility-hidden", message : ""});
    const [timeoutID, setTimeoutID] = useState(0);
    
    const handleSignInOnClick = (e) => {
        e.preventDefault();
        if(switchbtwn === "register") {
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Signed in 
                    const user = userCredential.user;
                    const storage = getStorage();
                    const auth = getAuth();

                    props.dispatch(updateSignIn(true));

                    props.dispatch(updateUid(user.uid));

                    // Create a storage reference from our storage service
                    const userRef = ref(storage, user.uid + "/events");
                    const colorRef = ref(storage, user.uid + "/colors");
                    const bioRef = ref(storage, user.uid + "/bio");

                    let f = JSON.stringify([]);
                    let c = JSON.stringify({
                        undesiredColors: [],
                        totalColors: [],
                        totalColorsNumber: {"#9fc0f5" : 0, "#4332d9" : 0, "#ae99e0" : 0, "#320699" : 0, "#c979bf" : 0, "#8a0e79" : 0, "#cf5f66" : 0, "#9e0812" : 0, "#93db7f" : 0, "#26820d" : 0, "#7adedc" : 0, "#0da3a1" : 0},
                        totalColorsLabel: {"#9fc0f5" : "", "#4332d9" : "", "#ae99e0" : "", "#320699" : "", "#c979bf" : "", "#8a0e79" : "", "#cf5f66" : "", "#9e0812" : "", "#93db7f" : "", "#26820d" : "", "#7adedc" : "", "#0da3a1" : ""},
                        totalColorsisLocked: {"#9fc0f5" : false, "#4332d9" : false, "#ae99e0" : false, "#320699" : false, "#c979bf" : false, "#8a0e79" : false, "#cf5f66" : false, "#9e0812" : false, "#93db7f" : false, "#26820d" : false, "#7adedc" : false, "#0da3a1" : false},
                    });

                    const file = new Blob([f], {
                        type: "application/json",
                    });

                    const colors = new Blob([c], {
                        type: "application/json",
                    });

                    const bio = new Blob([""], {
                        type: "application/json",
                    });

                    const errorReport = (error) => {
                        props.setErrorVisible("visibility-visible");
                        props.setErrorMessage("Error with creating events: " + error.code + ", use save icon to create instead");
                        clearTimeout(props.errorTimeID);
                        props.setErrorTimeID(setTimeout(() => {
                            props.setErrorVisible("visibility-hidden");
                        }, 10000));
                    }

                    uploadBytes(userRef, file).then((snapshot) => {
                        console.log('Uploaded a blob or file!');
                    }).catch((error) => {
                        errorReport(error);
                    });

                    uploadBytes(colorRef, colors).then((snapshot) => {
                        console.log('Uploaded a blob or file!');
                    }).catch((error) => {
                        errorReport(error);
                    });

                    uploadBytes(bioRef, bio).then((snapshot) => {
                        console.log('Uploaded a blob or file!');
                    }).catch((error) => {
                        errorReport(error);
                    });
                    //props.dispatch(replaceAll());
                    handleClose();
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    clearTimeout(timeoutID);
                    setErrorObj({visibility: "visibility-visible", message : "Error: " + errorCode});
                    setTimeoutID(setTimeout(() => {
                        setErrorObj({visibility: "visibility-hidden", message : ""});
                    }, 10000));
                });
        } else if (switchbtwn === "log in") {
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Signed in
                    const errorReport = (error) => {
                        props.setErrorVisible("visibility-visible");
                        props.setErrorMessage("Error with loading events: " + error.code + ", try reloading data in settings");
                        console.log('aaaaaa')
                        clearTimeout(props.errorTimeID);
                        props.setErrorTimeID(setTimeout(() => {
                            props.setErrorVisible("visibility-hidden");
                        }, 10000));
                    }
                    const user = userCredential.user;
                    const storage = getStorage();
                    props.dispatch(updatePfp(user.photoURL));
                    props.dispatch(updateName(user.displayName));
                    props.dispatch(updateSignIn(true));
                    props.dispatch(updateUid(user.uid));
                    getDownloadURL(ref(storage, user.uid + "/events"))
                        .then((url) => {
                            fetch(url)
                                .then((val) => val.json())
                                .then((ans) => props.dispatch(replaceAll(ans)))
                                .catch((error) => {
                                    errorReport(error);
                                })
                        })
                        .catch((error) => {
                            errorReport(error);
                        });

                    getDownloadURL(ref(storage, user.uid + "/colors"))
                        .then((url) => {
                            fetch(url)
                                .then((val) => val.json())
                                .then((ans) => props.dispatch(changeAllColors(ans)))
                                .catch((error) => {
                                    errorReport(error);
                                })
                            })
                        .catch((error) => {
                            errorReport(error);
                        });

                        getDownloadURL(ref(storage, user.uid + "/bio"))
                        .then((url) => {
                            fetch(url)
                                .then((val) => val.text())
                                .then((ans) => props.dispatch(updateBio(ans)))
                                .catch((error) => {
                                    console.log("whatshisname")
                                    errorReport(error);
                                })
                            })
                        .catch((error) => {
                            errorReport(error);
                        });

                    handleClose();
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    clearTimeout(timeoutID);
                    setErrorObj({visibility: "visibility-visible", message : "Error: " + errorCode});
                    setTimeoutID(setTimeout(() => {
                        setErrorObj({visibility: "visibility-hidden", message : ""});
                    }, 10000));
                });
        } else if (switchbtwn === "forgot") {
            sendPasswordResetEmail(auth, email)
                .then(() => {
                    // Password reset email sent!
                    // ..
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    clearTimeout(timeoutID);
                    setErrorObj({visibility: "visibility-visible", message : "Error: " + errorCode});
                    setTimeoutID(setTimeout(() => {
                        setErrorObj({visibility: "visibility-hidden", message : ""});
                    }, 10000));
                });
        }
        
    }

    const handleSwitch = (val) => {
        switch(val) {
            case "register":
                setSwitchbtwn("register");
                setChangingWords({extra: "Log in", popup: "Register", title: "Register"});
                break;
            case "log in":
                setSwitchbtwn("log in");
                setChangingWords({extra: "Register", popup: "Log in", title: "Log in"});
                break;
            case "forgot":
                setSwitchbtwn("forgot");
                setChangingWords({extra: "Log in", popup: "Reset", title: "Reset Password"});
                break;
        }
    }

    const handleChangeClick = () => {
        if(switchbtwn === "register") {
            handleSwitch("log in");
        } else if(switchbtwn === "log in") {
            handleSwitch("register");
        } else {
            handleSwitch("log in");
        }
    }

    const handleClose = () => {
        props.setPopupVisible("visibility-hidden");
        setEmail("");
        setPassword("");
        setSwitchbtwn("log in")
        setChangingWords({extra: "Register", popup: "Log in", title: "Log in"});
        setErrorObj({visibility: "visibility-hidden", message : ""});
        clearTimeout(timeoutID);
        setTimeoutID(0);
    }

    if(switchbtwn === "forgot") {
        return (
            <div className={'header-sign-in-popup-container ' + props.popupVisible}>
                <div className={'header-sign-in-popup-error ' + errorObj.visibility}>{errorObj.message}</div>
                <svg className='header-sign-in-popup-exit svg-fill' onClick={() => handleClose()} xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                <div className='header-sign-in-popup-title'>{changingWords.title}</div>
                <form className='header-sign-in-popup-form' onSubmit={(e) => handleSignInOnClick(e)}>
                    <div className='header-sign-in-popup-email-container'>
                        <div>Email</div>
                        <input className='header-sign-in-popup-email' type='email' required onChange={(e) => setEmail(e.target.value)} value={email}/>
                    </div>
                    <input type='submit' className='header-sign-in-popup-log-in' value={changingWords.popup}/>
                    <div className='header-sign-in-popup-extra'>
                        <div className='header-sign-in-popup-register' onClick={() => handleChangeClick()}>{changingWords.extra}</div>
                        <div>•</div>
                        <div className='header-sign-in-popup-forgot-password' onClick={() => handleSwitch("forgot")}>Forgot Password</div>
                    </div>
                </form>
            </div>
        )
    }

    return (
        <div className={'header-sign-in-popup-container ' + props.popupVisible}>
            <div className={'header-sign-in-popup-error ' + errorObj.visibility}>{errorObj.message}</div>
            <svg className='header-sign-in-popup-exit svg-fill' onClick={() => handleClose()} xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
            <div className='header-sign-in-popup-title'>{changingWords.title}</div>
            <form className='header-sign-in-popup-form' onSubmit={(e) => handleSignInOnClick(e)}>
                <div className='header-sign-in-popup-email-container'>
                    <div>Email</div>
                    <input className='header-sign-in-popup-email' type='email' required onChange={(e) => setEmail(e.target.value)} value={email}/>
                </div>
                <div className='header-sign-in-popup-password-container'>
                    <div>Password <span className={switchbtwn === "register" ? 'header-sign-in-popup-password-text-span' : 'header-sign-in-popup-password-text-span visibility-hidden'}>(min 8 characters)</span></div>
                    <input type='password' className='header-sign-in-popup-password' minLength={switchbtwn === "register" ? "8" : "0"} required onChange={(e) => setPassword(e.target.value)} value={password}/>
                </div>
                <input type='submit' className='header-sign-in-popup-log-in' value={changingWords.popup}/>
                <div className='header-sign-in-popup-extra'>
                    <div className='header-sign-in-popup-register' onClick={() => handleChangeClick()}>{changingWords.extra}</div>
                    <div>•</div>
                    <div className='header-sign-in-popup-forgot-password' onClick={() => handleSwitch("forgot")}>Forgot Password</div>
                </div>
            </form>
        </div>
    )
}

function HeaderSignIn(props) {

    const [popupVisible, setPopupVisible] = useState("visibility-hidden");

    const handleOpenPopup = () => {
        setPopupVisible("visibility-visible");
    }

    const handleSignOut = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
          // Sign-out successful.
            props.dispatch(replaceAll([]));
            props.dispatch(resetSignIn());
            props.dispatch(changeAllColors({
                undesiredColors: [],
                totalColors: [],
                totalColorsNumber: {"#9fc0f5" : 0, "#4332d9" : 0, "#ae99e0" : 0, "#320699" : 0, "#c979bf" : 0, "#8a0e79" : 0, "#cf5f66" : 0, "#9e0812" : 0, "#93db7f" : 0, "#26820d" : 0, "#7adedc" : 0, "#0da3a1" : 0},
                totalColorsLabel: {"#9fc0f5" : "", "#4332d9" : "", "#ae99e0" : "", "#320699" : "", "#c979bf" : "", "#8a0e79" : "", "#cf5f66" : "", "#9e0812" : "", "#93db7f" : "", "#26820d" : "", "#7adedc" : "", "#0da3a1" : ""},
                totalColorsisLocked: {"#9fc0f5" : false, "#4332d9" : false, "#ae99e0" : false, "#320699" : false, "#c979bf" : false, "#8a0e79" : false, "#cf5f66" : false, "#9e0812" : false, "#93db7f" : false, "#26820d" : false, "#7adedc" : false, "#0da3a1" : false},
            }));
        }).catch((error) => {
            props.setErrorVisible("visibility-visible");
            props.setErrorMessage("Error with signing out: " + error.code);
            clearTimeout(props.errorTimeID);
            props.setErrorTimeID(setTimeout(() => {
                props.setErrorVisible("visibility-hidden");
            }, 10000));
        });
    }

    //until further notice
    // useEffect(() => {
    //     handleSignOut();
    // }, [])

    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/auth.user
            const errorReport = (error) => {
                props.setErrorVisible("visibility-visible");
                props.setErrorMessage("Error with loading events: " + error.code + ", try reloading again");
                console.log('bbbbbb')
                clearTimeout(props.errorTimeID);
                props.setErrorTimeID(setTimeout(() => {
                    props.setErrorVisible("visibility-hidden");
                }, 10000));
            }

            if(user.photoURL !== null) props.dispatch(updatePfp(user.photoURL));
            else props.dispatch(updatePfp(""));
            if(user.displayName !== null) props.dispatch(updateName(user.displayName));
            else props.dispatch(updateName(""));
            props.dispatch(updateSignIn(true));
            props.dispatch(updateUid(user.uid));

            const storage = getStorage();

            getDownloadURL(ref(storage, user.uid + "/events"))
            .then((url) => {
                fetch(url)
                    .then((val) => val.json())
                    .then((ans) => props.dispatch(replaceAll(ans)))
                    .catch((error) => {
                        errorReport(error);
                    })
            })
            .catch((error) => {
                if(error.code === 'storage/object-not-found') {
                    props.dispatch(replaceAll([]));
                } else {
                    errorReport(error);
                }
            });

            getDownloadURL(ref(storage, user.uid + "/colors"))
            .then((url) => {
                fetch(url)
                    .then((val) => val.json())
                    .then((ans) => props.dispatch(changeAllColors(ans)))
                    .catch((error) => {
                        errorReport(error);
                    })
                })
            .catch((error) => {
                if(error.code === 'storage/object-not-found') {
                    props.dispatch(changeAllColors({
                        undesiredColors: [],
                        totalColors: [],
                        totalColorsNumber: {"#9fc0f5" : 0, "#4332d9" : 0, "#ae99e0" : 0, "#320699" : 0, "#c979bf" : 0, "#8a0e79" : 0, "#cf5f66" : 0, "#9e0812" : 0, "#93db7f" : 0, "#26820d" : 0, "#7adedc" : 0, "#0da3a1" : 0},
                        totalColorsLabel: {"#9fc0f5" : "", "#4332d9" : "", "#ae99e0" : "", "#320699" : "", "#c979bf" : "", "#8a0e79" : "", "#cf5f66" : "", "#9e0812" : "", "#93db7f" : "", "#26820d" : "", "#7adedc" : "", "#0da3a1" : ""},
                        totalColorsisLocked: {"#9fc0f5" : false, "#4332d9" : false, "#ae99e0" : false, "#320699" : false, "#c979bf" : false, "#8a0e79" : false, "#cf5f66" : false, "#9e0812" : false, "#93db7f" : false, "#26820d" : false, "#7adedc" : false, "#0da3a1" : false},
                    }));
                } else {
                    errorReport(error);
                }
            });

            getDownloadURL(ref(storage, user.uid + "/bio"))
            .then((url) => {
                fetch(url)
                    .then((val) => val.text())
                    .then((ans) => props.dispatch(updateBio(ans)))
                    .catch((error) => {
                        errorReport(error);
                    })
                })
            .catch((error) => {
                if(error.code === 'storage/object-not-found') {
                    props.dispatch(updateBio(""));
                } else {
                    errorReport(error);
                }
            });
            
            // ...
        } else {
            // User is signed out
            // ...
            //console.log('wut')
        }
        });
    }, [])
    
    if(!props.signInStatus.signedIn) {
        return(
            <div className='header-signIn-container'>
                <div className='header-signIn-text' onClick={() => handleOpenPopup()}>Sign In</div>
                <img className='header-signIn-profile-pic' src="https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg"/>
                <div className={'header-sign-in-cover ' + popupVisible}></div>
                <HeaderSignInPopup popupVisible={popupVisible} setPopupVisible={setPopupVisible} {...props}/>
            </div>
        );
    } else {
        return(
            <div className='header-signIn-container'>
                <div className='header-signIn-text' onClick={() => handleSignOut()}>Sign Out</div>
                <img className='header-signIn-profile-pic' src={props.signInStatus.pfp !== "" ? props.signInStatus.pfp : "https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg"}/>
            </div>
        );
    }
    
}

function HeaderDescription({currentDate, dispatch}) {
    const convertMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    let display = "";

    switch(currentDate.specifics) {
        case "month":
            display = convertMonths[currentDate.month] + ", " + currentDate.year;
            break;
        case "year":
            display = currentDate.year;
            break;
        case "week":
            let curDay = new Date(currentDate.year, currentDate.month, currentDate.day);
            let dayOne = new Date(curDay.getFullYear(), curDay.getMonth(), curDay.getDate() - curDay.getDay());
            let dayTwo = new Date(curDay.getFullYear(), curDay.getMonth(), curDay.getDate() + 6 - curDay.getDay());
            if(dayOne.getFullYear() !== dayTwo.getFullYear()) {
                display = convertMonths[dayOne.getMonth()].substring(0, 3) + " " + dayOne.getDate() + ", " + (dayOne.getFullYear() % 100) + " - " + convertMonths[dayTwo.getMonth()].substring(0, 3) + " " + dayTwo.getDate() + ", " + (dayTwo.getFullYear() % 100);
            } else if(dayOne.getMonth() !== dayTwo.getMonth()) {
                display = convertMonths[dayOne.getMonth()].substring(0, 3) + " " + dayOne.getDate() + " - " + convertMonths[dayTwo.getMonth()].substring(0, 3) + " " + dayTwo.getDate() + ", " + dayTwo.getFullYear();
            } else {
                display = convertMonths[dayOne.getMonth()].substring(0, 3) + " " + dayOne.getDate() + " - " + dayTwo.getDate() + ", " + dayTwo.getFullYear();
            }
            break;
        case "day":
            display = convertMonths[currentDate.month] + " " + currentDate.day + ", " + currentDate.year;
            break;
    }

    const changeDateEnablerMinus = () => {
        if(currentDate.month === 0) {
            return {
                    year: currentDate.year - 1,
                    month: 11,
                    day: 1
                }
        } else {
            return {
                    year: currentDate.year,
                    month: currentDate.month - 1,
                    day: 1
                }
            }
        }

    const changeDateEnablerPlus = () => {
        if(currentDate.month === 11) {
            return {
                year: currentDate.year + 1,
                month: 0,
                day: 1
            }
        } 
        else {
            return {
                year: currentDate.year,
                month: currentDate.month + 1,
                day: 1
            }
        }
    }

    const changeCalendarDatePlus = () => {
        let curDay = new Date(currentDate.year, currentDate.month, currentDate.day);
        switch(currentDate.specifics) {
            case "month":
                return changeDateEnablerPlus();
            case "year":
                return {year: currentDate.year + 1, month: 0, day: 1};
            case "week":
                curDay.setDate(curDay.getDate() + 7);
                return {year: curDay.getFullYear(), month: curDay.getMonth(), day: curDay.getDate()};
            case "day":
                curDay.setDate(curDay.getDate() + 1);
                return {year: curDay.getFullYear(), month: curDay.getMonth(), day: curDay.getDate()};
            case "schedule":
                curDay.setDate(curDay.getDate() + 1);
                return {year: curDay.getFullYear(), month: curDay.getMonth(), day: curDay.getDate()};
        }
    }

    const changeCalendarDateMinus = () => {
        let curDay = new Date(currentDate.year, currentDate.month, currentDate.day);
        switch(currentDate.specifics) {
            case "month":
                return changeDateEnablerMinus();
            case "year":
                return {year: currentDate.year - 1, month: 0, day: 1};
            case "week":
                curDay.setDate(curDay.getDate() - 7);
                return {year: curDay.getFullYear(), month: curDay.getMonth(), day: curDay.getDate()};
            case "day":
                curDay.setDate(curDay.getDate() - 1);
                return {year: curDay.getFullYear(), month: curDay.getMonth(), day: curDay.getDate()};
            case "schedule":
                curDay.setDate(curDay.getDate() - 1);
                return {year: curDay.getFullYear(), month: curDay.getMonth(), day: curDay.getDate()};
        }
    }

    return(
        <div className='header-description-container'>
            <div className='header-description-arrow-left' onClick={() => dispatch(changeDate(changeCalendarDateMinus()))}>
                <svg className='svg-fill' xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/></svg>
            </div>
            <div className='header-description-arrow-right' onClick={() => dispatch(changeDate(changeCalendarDatePlus()))}>
                <svg className='svg-fill' xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512"><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>
            </div>
            <div className='header-description-title'>{display}</div>
        </div>
    );
}

function HeaderToday({dispatch}) {
    let curDay = new Date();
    return(
        <div className='header-today' onClick={() => dispatch(changeDate({year: curDay.getFullYear(), month: curDay.getMonth(), day: curDay.getDate()}))}>Today</div>
    )
}

function HeaderSave(props) {

    const auth = getAuth();
    const user = auth.currentUser;

    const handleUploadOnClick = () => {
        
        const errorReport = (error) => {
            props.setErrorVisible("visibility-visible");
            props.setErrorMessage("Error with loading events: " + error.code + ", try reloading again");
            console.log('cccccc')
            clearTimeout(props.errorTimeID);
            props.setErrorTimeID(setTimeout(() => {
                props.setErrorVisible("visibility-hidden");
            }, 10000));
        }

        // Get a reference to the storage service, which is used to create references in your storage bucket
        const storage = getStorage();
        const auth = getAuth();
        const user = auth.currentUser;

        // Create a storage reference from our storage service
        const userRef = ref(storage, user.uid + "/events");
        const colorRef = ref(storage, user.uid + "/colors")

        let uploadedFile = JSON.stringify(props.currentEvents);
        let uploadedColor = JSON.stringify(props.currentColors);

        const file = new Blob([uploadedFile], {
            type: "application/json",
        });

        const colors = new Blob([uploadedColor], {
            type: "application/json",
        });

        uploadBytes(userRef, file).then((snapshot) => {
            console.log('Uploaded a blob or file!');
            document.querySelector(".header-save-icon").style.fill = "#0CDF4C";
            setTimeout(() => {
                document.querySelector(".header-save-icon").style.fill = "";
            }, 2500);
        }).catch((error) => {
            errorReport(error);
        });

        uploadBytes(colorRef, colors).then((snapshot) => {
            console.log('Uploaded a blob or file!');
            document.querySelector(".header-save-icon").style.fill = "#0CDF4C";
            setTimeout(() => {
                document.querySelector(".header-save-icon").style.fill = "";
            }, 2500);
        }).catch((error) => {
            errorReport(error);
        });
    }

    return(
        <svg className={props.signInStatus.signedIn ? 'header-save-icon svg-fill' : 'header-save-icon svg-fill visibility-hidden'} onClick={() => handleUploadOnClick()} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>
    )
}

function HeaderSettings(props) {
    const [settingsVisibility, setSettingsVisibility] = useState("visibility-hidden");
    const [darkMode, setDarkMode] = useState({mode: "light", text: "Light"});
    const [alerts, setAlerts] = useState("Off");
    const [startTimes, setStartTimes] = useState([]);
    const [clearTimeID, setClearTimeID] = useState(0);
    const [pfpVisibility, setPfpVisibility] = useState("visibility-hidden");
    const auth = getAuth();
    const user = auth.currentUser;

    //light or dark mode
    //alerts on or off
    //reload data
    //change pfp
    //view account

    // useEffect(() =>{
    //     setClearTimeID(setInterval(() => {
    //         setStartTimes((start) => {
    //             let cur = new Date();
    //             let str1 = "";
    //             let str2 = "";
    //             let num = 0;
    //             start.map((item) => {
    //                 if(item.time - cur.getTime() < 305000 && item.time - cur.getTime() > 300000) {
    //                     if(num === 0) {
    //                         str1 += item.title;
    //                     } else if(num === 1) {
    //                         str2 += item.title;
    //                     }
    //                     num++;
    //                 }
    //             });
    //             cur.setMinutes(cur.getMinutes() + 6);
    //             if(num === 1) {
    //                 alert(str1 + " will start in 5 minutes at " + getHourAndMinutes(cur.getHours(), cur.getMinutes()) + "!")
    //             } else if(num === 2) {
    //                 alert(str1 + " and " + str2 + " will start in 5 minutes at " + getHourAndMinutes(cur.getHours(), cur.getMinutes()) + "!");
    //             } else if(num > 2) {
    //                 alert(str1 + ", " + str2 + ", and " + (num - 2) + " more will start in 5 minutes at " + getHourAndMinutes(cur.getHours(), cur.getMinutes()) + "!")
    //             }
    //             return start;
    //         })
    //     }, 5000));
    // }, [])

    useEffect(() => {
        let start = props.currentEvents.filter((item) => !item.isAllDay.one && !item.repeat).map((item) => {
            return {title: item.title, time: new Date(item.startTime).getTime()};
        }).concat(props.currentEvents.filter((item) => !item.isAllDay.one && item.repeat).map((event) => {
            return createEventsRepeated(event, new Date().getTime(), new Date().getTime() + 86400000);
        }).flat().map((item) => {
            return {title: item.title, time: new Date(item.startTime).getTime()};
        })).filter((item) => {
            return item.time >= new Date().getTime();
        }).sort((a, b) => a.time - b.time)
        setStartTimes(start);
    }, [props.currentEvents]);

    const reference = useRef();

    useEffect(() => {
        const HeaderDropdownMenuClicked = (e) => {
            if(settingsVisibility === "visibility-visible" && reference.current && !reference.current.contains(e.target)) {
                setSettingsVisibility("visibility-hidden")
            }
        }

        document.addEventListener("click", HeaderDropdownMenuClicked);

        return () => {
            document.removeEventListener("click", HeaderDropdownMenuClicked);
        }
    }, [settingsVisibility]);

    let variables = [
    "--body-background-color", 
    "--division-color",
    "--clickable-background-color",
    "--clickable-hover-background-color",
    "--popup-background-color",
    "--box-shadow-color",
    "--header-popup-color",
    "--border-hover-color",
    "--text-color-gray",
    "--text-color-black",
    "--header-dropdown-color",
    "--header-dark-mode-light",
    "--header-dark-mode-dark",
    "--add-event-popup-background-color",
    "--add-event-popup-input-hover",
    "--add-event-popup-time-hover",
    "--popup-view-all-background-color",
    "--border-text-color",
    "--date-hover-color",
    "--label-disabled-color",
    "--add-event-hover-color",
    "--add-event-hover-color-day",
    "--header-sign-in-text-color",
    "--opposite-text-color",
    "--date-hover-hover-color"];

    let variableColors = [
        "rgb(11, 70, 70)",
        "rgb(227, 243, 243)",
        "rgb(40, 124, 124)",
        "rgb(20, 160, 160)",
        "rgb(0, 121, 121)",
        "rgb(31, 31, 31)",
        "rgb(11, 117, 117)",
        "rgb(35, 190, 190)",
        "rgb(173, 173, 173)",
        "rgb(230, 230, 230)",
        "rgb(20, 104, 104)",
        "rgb(25, 25, 25)",
        "rgb(230, 230, 230)",
        "rgb(0, 104, 104)",
        "rgb(0, 71, 71)",
        "rgb(33, 87, 87)",
        "rgb(32, 83, 83)",
        "rgb(255, 255, 255)",
        "rgb(57, 161, 161)",
        "rgb(92, 92, 92)",
        "rgb(7, 109, 109)",
        "rgb(12, 172, 172)",
        "rgb(92, 228, 228)",
        "rgb(230, 230, 230)",
        "rgb(0, 158, 139)"
    ]

    const handleChangeModeOnClick = () => {
        if(darkMode.mode === "light") {
            setDarkMode({mode: "dark", text: "Dark"});

            document.querySelector(".header-settings-dark-mode-circle").style.left = "26px";

            let r = document.querySelector(':root');
            r.style.color = "white";
            for(let i = 0; i < variables.length; i++) {
                r.style.setProperty(variables[i], variableColors[i]);
            }

            let s = document.querySelectorAll(".svg-fill")
            s.forEach((item) => item.classList.replace("svg-fill", "svg-fill-dark"));

            let l = document.querySelectorAll(".line-fill");
            l.forEach((item) => item.classList.replace("line-fill", "line-fill-dark"));

        } else {
            setDarkMode({mode: "light", text: "Light"});

            document.querySelector(".header-settings-dark-mode-circle").style.left = "";

            let r = document.querySelector(':root');
            r.style.color = "";
            for(let i = 0; i < variables.length; i++) {
                r.style.setProperty(variables[i], "");
            }

            let s = document.querySelectorAll(".svg-fill-dark")
            s.forEach((item) => item.classList.replace("svg-fill-dark", "svg-fill"));

            let l = document.querySelectorAll(".line-fill-dark");
            l.forEach((item) => item.classList.replace("line-fill-dark", "line-fill"));
        }
    }

    const handleChangeAlertsOnClick = () => {
        if(alerts === "On") {
            setAlerts("Off");
            document.querySelector(".header-settings-alerts-circle-container").style.left = "";
            document.querySelector(".header-settings-alerts-circle").style.fill = "";
            clearInterval(clearTimeID);
        } else {
            setAlerts("On");
            document.querySelector(".header-settings-alerts-circle-container").style.left = "0px";
            document.querySelector(".header-settings-alerts-circle").style.fill = "rgb(0, 179, 24)";

            setClearTimeID(setInterval(() => {
                setStartTimes((start) => {
                    let cur = new Date();
                    let str1 = "";
                    let str2 = "";
                    let num = 0;
                    start.map((item) => {
                        if(item.time - cur.getTime() < 305000 && item.time - cur.getTime() > 300000) {
                            if(num === 0) {
                                str1 += item.title;
                            } else if(num === 1) {
                                str2 += item.title;
                            }
                            num++;
                        }
                    });
                    cur.setMinutes(cur.getMinutes() + 6);
                    if(num === 1) {
                        alert(str1 + " will start in 5 minutes at " + getHourAndMinutes(cur.getHours(), cur.getMinutes()) + "!")
                    } else if(num === 2) {
                        alert(str1 + " and " + str2 + " will start in 5 minutes at " + getHourAndMinutes(cur.getHours(), cur.getMinutes()) + "!");
                    } else if(num > 2) {
                        alert(str1 + ", " + str2 + ", and " + (num - 2) + " more will start in 5 minutes at " + getHourAndMinutes(cur.getHours(), cur.getMinutes()) + "!")
                    }
                    return start;
                })
            }, 5000));
        }
    }

    const handleReloadOnClick = () => {

        const errorReport = (error) => {
            props.setErrorVisible("visibility-visible");
            props.setErrorMessage("Error with loading events: " + error.code + ", try reloading again");
            console.log('dddddd')
            clearTimeout(props.errorTimeID);
            props.setErrorTimeID(setTimeout(() => {
                props.setErrorVisible("visibility-hidden");
            }, 10000));
        }

        const auth = getAuth();
        const user = auth.currentUser;
        const storage = getStorage();

        if(user) {
            getDownloadURL(ref(storage, user.uid + "/events"))
            .then((url) => {
                fetch(url)
                    .then((val) => val.json())
                    .then((ans) => props.dispatch(replaceAll(ans)))
                    .catch((error) => {
                        errorReport(error);
                    })
            })
            .catch((error) => {
                errorReport(error);
            });

            getDownloadURL(ref(storage, user.uid + "/colors"))
            .then((url) => {
                fetch(url)
                    .then((val) => val.json())
                    .then((ans) => props.dispatch(changeAllColors(ans)))
                    .catch((error) => {
                        errorReport(error);
                    })
                })
            .catch((error) => {
                errorReport(error);
            });

            getDownloadURL(ref(storage, user.uid + "/bio"))
            .then((url) => {
                fetch(url)
                    .then((val) => val.text())
                    .then((ans) => props.dispatch(updateBio(ans)))
                    .catch((error) => {
                        errorReport(error);
                    })
                })
            .catch((error) => {
                errorReport(error);
            });
        } else {
            props.setErrorVisible("visibility-visible");
            props.setErrorMessage("Error with loading events: user not signed in, sign in before reloading data");
            clearTimeout(props.errorTimeID);
            props.setErrorTimeID(setTimeout(() => {
                props.setErrorVisible("visibility-hidden");
            }, 10000));
        }
        setSettingsVisibility("visibility-hidden");
    }

    const handleProfileOnClick = () => {
        setPfpVisibility("visibility-visible");
        setSettingsVisibility("visibility-hidden");
    }

    const handleSettingsVisibleOnClick = () => {
        setSettingsVisibility("visibility-visible");
    }

    return(
        <div className='header-settings-container' ref={reference}>
            <svg onClick={() => handleSettingsVisibleOnClick()} className={props.signInStatus.signedIn ? 'header-settings-icon svg-fill' : 'header-settings-icon svg-fill visibility-hidden'} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>
            <div className={'header-settings ' + settingsVisibility}>
                <div className='header-settings-dark-mode-container'>
                    <div className='header-settings-dark-mode-text'>{darkMode.text}</div>
                    <div className='header-settings-dark-mode-graphics' onClick={() => handleChangeModeOnClick()}>
                        <svg className='header-settings-dark-mode-circle' xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z"/></svg>
                        <svg className='header-settings-dark-mode-day' xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M375.7 19.7c-1.5-8-6.9-14.7-14.4-17.8s-16.1-2.2-22.8 2.4L256 61.1 173.5 4.2c-6.7-4.6-15.3-5.5-22.8-2.4s-12.9 9.8-14.4 17.8l-18.1 98.5L19.7 136.3c-8 1.5-14.7 6.9-17.8 14.4s-2.2 16.1 2.4 22.8L61.1 256 4.2 338.5c-4.6 6.7-5.5 15.3-2.4 22.8s9.8 13 17.8 14.4l98.5 18.1 18.1 98.5c1.5 8 6.9 14.7 14.4 17.8s16.1 2.2 22.8-2.4L256 450.9l82.5 56.9c6.7 4.6 15.3 5.5 22.8 2.4s12.9-9.8 14.4-17.8l18.1-98.5 98.5-18.1c8-1.5 14.7-6.9 17.8-14.4s2.2-16.1-2.4-22.8L450.9 256l56.9-82.5c4.6-6.7 5.5-15.3 2.4-22.8s-9.8-12.9-17.8-14.4l-98.5-18.1L375.7 19.7zM269.6 110l65.6-45.2 14.4 78.3c1.8 9.8 9.5 17.5 19.3 19.3l78.3 14.4L402 242.4c-5.7 8.2-5.7 19 0 27.2l45.2 65.6-78.3 14.4c-9.8 1.8-17.5 9.5-19.3 19.3l-14.4 78.3L269.6 402c-8.2-5.7-19-5.7-27.2 0l-65.6 45.2-14.4-78.3c-1.8-9.8-9.5-17.5-19.3-19.3L64.8 335.2 110 269.6c5.7-8.2 5.7-19 0-27.2L64.8 176.8l78.3-14.4c9.8-1.8 17.5-9.5 19.3-19.3l14.4-78.3L242.4 110c8.2 5.7 19 5.7 27.2 0zM256 368a112 112 0 1 0 0-224 112 112 0 1 0 0 224zM192 256a64 64 0 1 1 128 0 64 64 0 1 1 -128 0z"/></svg>
                        <div className='header-settings-dark-mode-night'>
                            <svg className='header-settings-dark-mode-moon' xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"/></svg>
                            <svg className='header-settings-dark-mode-star1' xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>
                            <svg className='header-settings-dark-mode-star2' xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>
                        </div>
                    </div>
                </div>
                <div className='header-settings-alerts-container'>
                    <div className='header-settings-alerts-text'>Alerts</div>
                    <div className='header-settings-alerts-controls' onClick={() => handleChangeAlertsOnClick()}>
                        <div className='header-settings-alerts-circle-container'>
                            <svg className='header-settings-alerts-circle' xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z"/></svg>
                            <div className='header-settings-alert-circle-text'>{alerts}</div>
                        </div>
                    </div>
                </div>
                <div className='header-settings-pfp-button' onClick={() => handleProfileOnClick()}>
                    <div className='header-settings-pfp-text'>View Profile</div>
                </div>
                <HeaderProfile pfpVisibility={pfpVisibility} setPfpVisibility={setPfpVisibility} dispatch={props.dispatch} signInStatus={props.signInStatus}/>
                <div className='header-settings-reload-button' onClick={() => handleReloadOnClick()}>
                    <div className='header-settings-reload-text'>Reload Data</div>
                </div>
            </div>
        </div>
    )
}

function HeaderProfile(props) {
    const auth = getAuth();
    const user = auth.currentUser;

    const [imgVis, setImgVis] = useState("visibility-hidden");
    const [nameVis, setNameVis] = useState("visibility-hidden");
    const [bioVis, setBioVis] = useState("visibility-hidden");
    // const [name, setName] = useState(user.displayName);
    // const [bio, setBio] = useState("");

    const handleExit = () => {
        props.setPfpVisibility("visibility-hidden");
    }

    const handleImgVisOnClick = () => {
        setImgVis("visibility-visible");
    }

    const handleNameVisOnClick = () => {
        setNameVis("visibility-visible");
    }

    const handleBioVisOnClick = () => {
        setBioVis("visibility-visible");
    }

    return(
        <React.Fragment>
            <div className={'header-profile-cover ' + props.pfpVisibility}></div>
            <div className={'header-profile-container ' + props.pfpVisibility}>
            <svg className='header-profile-exit svg-fill' onClick={() => handleExit()} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                <div className='header-profile-image-container'>
                    <img className='header-profile-image' src={user ? user.photoURL ? user.photoURL : "https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg" : "https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg"}/>
                    <div className='header-profile-image-edit-circle' onClick={() => handleImgVisOnClick()}>
                        <svg className='header-profile-image-edit-icon svg-fill' xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"/></svg>
                    </div>
                </div>
                <HeaderPfpSet imgVis={imgVis} setImgVis={setImgVis} dispatch={props.dispatch}/>

                <div className='header-profile-name-container'>
                    <div className='header-profile-name'>{user ? user.displayName ? user.displayName : "[No name set]" : "[No name set]"}</div>
                    <div className='header-profile-name-edit-circle' onClick={() => handleNameVisOnClick()}>
                        <svg className='header-profile-name-edit-icon svg-fill' xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"/></svg>
                    </div>
                </div>
                <HeaderNameSet nameVis={nameVis} setNameVis={setNameVis} dispatch={props.dispatch}/>

                <div className='header-profile-bio-container'>
                    <div className='header-profile-bio-title'>Bio:</div>
                    <div className='header-profile-bio'>
                        <div className='header-profile-text'>{props.signInStatus.bio === "" ? "Nothing so far..." : props.signInStatus.bio}</div>
                    </div>
                    <div className='header-profile-bio-edit-circle' onClick={() => handleBioVisOnClick()}>
                        <svg className='header-profile-bio-edit-icon svg-fill' xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"/></svg>
                    </div>
                </div>
                <HeaderBioSet bioVis={bioVis} setBioVis={setBioVis} dispatch={props.dispatch}/>
            </div>
        </React.Fragment>
    )
}

function HeaderPfpSet(props) {

    const [pfp, setPfp] = useState("");

    const auth = getAuth();
    const handleSubmitOnClick = (e) => {
        e.preventDefault();
        props.dispatch(updatePfp(pfp));
        updateProfile(auth.currentUser, {
            photoURL: pfp
          }).then(() => {
            // Profile updated!
            props.setImgVis("visibility-hidden");
            setPfp("");
          }).catch((error) => {
            // An error occurred
            // ...
          });
    }

    const handleExit = () => {
        props.setImgVis("visibility-hidden");
        setPfp("");
    }

    return(
        <React.Fragment>
            <div className={'header-pfp-change-cover ' + props.imgVis}></div>
            <div className={'header-pfp-change-container ' + props.imgVis}>
                <svg className='header-pfp-exit svg-fill' onClick={() => handleExit()} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                <div>Input new pfp link:</div>
                <form className='header-pfp-change-form' onSubmit={(e) => handleSubmitOnClick(e)}>
                    <input className='header-pfp-change-input' type="url" value={pfp} onChange={(e) => setPfp(e.target.value)} required/>
                    <input type="submit" className='header-pfp-change-submit' value="Change"/>
                </form>
            </div>
        </React.Fragment>
    )
}

function HeaderNameSet(props) {
    const [pfp, setPfp] = useState("");

    const auth = getAuth();
    const handleSubmitOnClick = (e) => {
        e.preventDefault();
        props.dispatch(updateName(pfp));
        updateProfile(auth.currentUser, {
            displayName: pfp
          }).then(() => {
            // Profile updated!
            props.setNameVis("visibility-hidden");
            setPfp("");
          }).catch((error) => {
            // An error occurred
            // ...
          });
    }

    const handleExit = () => {
        props.setNameVis("visibility-hidden");
        setPfp("");
    }

    return(
        <React.Fragment>
            <div className={'header-pfp-change-cover ' + props.nameVis}></div>
            <div className={'header-pfp-change-container ' + props.nameVis}>
                <svg className='header-pfp-exit svg-fill' onClick={() => handleExit()} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                <div>Input new display name:</div>
                <form className='header-pfp-change-form' onSubmit={(e) => handleSubmitOnClick(e)}>
                    <input className='header-pfp-change-input' type="text" value={pfp} onChange={(e) => setPfp(e.target.value)} required/>
                    <input type="submit" className='header-pfp-change-submit' value="Change"/>
                </form>
            </div>
        </React.Fragment>
    )
}

function HeaderBioSet(props) {
    const [pfp, setPfp] = useState("");

    const handleSubmitOnClick = (e) => {
        e.preventDefault();
        const storage = getStorage();
        const auth = getAuth();
        const user = auth.currentUser;

        // Create a storage reference from our storage service
        const userRef = ref(storage, user.uid + "/bio");

        const file = new Blob([pfp], {
            type: "application/json",
        });

        uploadBytes(userRef, file).then((snapshot) => {
            props.dispatch(updateBio(pfp));
            props.setBioVis("visibility-hidden");
            setPfp("");
            console.log('Uploaded a blob or file!');
        }).catch((error) => {

        });
    }

    const handleExit = () => {
        props.setBioVis("visibility-hidden");
        setPfp("");
    }

    return(
        <React.Fragment>
            <div className={'header-pfp-change-cover ' + props.bioVis}></div>
            <div className={'header-pfp-change-container ' + props.bioVis}>
                <svg className='header-pfp-exit svg-fill' onClick={() => handleExit()} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                <div>Input new bio:</div>
                <form className='header-pfp-change-form' onSubmit={(e) => handleSubmitOnClick(e)}>
                    <textarea className='header-bio-change-input' onChange={(e) => setPfp(e.target.value)} value={pfp} required></textarea>
                    <input type="submit" className='header-pfp-change-submit' value="Change"/>
                </form>
            </div>
        </React.Fragment>
    )
}

function HeaderError(props) {
    return(
        <div className={'header-error-container ' + props.errorVisible}>
            <div className='header-error-text'>{props.errorMessage}</div>
        </div>
    )
}

function Header() {
    const currentDate = useSelector((state) => state.date);
    const signInStatus = useSelector((state) => state.signIn);
    const currentColors = useSelector((state) => state.color);
    const dispatch = useDispatch();
    const [menuHidden, setMenuHidden] = useState(false);
    const currentEvents = useSelector((state) => state.event.events);
    const [errorVisible, setErrorVisible] = useState("visibility-hidden");
    const [errorMessage, setErrorMessage] = useState("");
    const [errorTimeID, setErrorTimeID] = useState(0);
    // const auth = getAuth();
    // const user = auth.currentUser;
    // console.log(user)
    return(
        <div className="calendar-header">
            <HeaderToggleSideMenu menuHidden={menuHidden} setMenuHidden={setMenuHidden}/>
            <HeaderCalendar />
            <HeaderToday dispatch={dispatch} />
            <HeaderDescription currentDate={currentDate} dispatch={dispatch}/>
            <HeaderDropdownMenu currentDate={currentDate} dispatch={dispatch}/>
            <HeaderSave currentEvents={currentEvents} signInStatus={signInStatus} currentColors={currentColors} setErrorVisible={setErrorVisible} setErrorMessage={setErrorMessage} errorTimeID={errorTimeID} setErrorTimeID={setErrorTimeID}/>
            <HeaderSettings currentEvents={currentEvents} signInStatus={signInStatus} dispatch={dispatch} setErrorVisible={setErrorVisible} setErrorMessage={setErrorMessage} errorTimeID={errorTimeID} setErrorTimeID={setErrorTimeID}/>
            <HeaderSignIn dispatch={dispatch} signInStatus={signInStatus} currentEvents={currentEvents} currentColors={currentColors} setErrorVisible={setErrorVisible} setErrorMessage={setErrorMessage} errorTimeID={errorTimeID} setErrorTimeID={setErrorTimeID}/>
            <HeaderError errorVisible={errorVisible} errorMessage={errorMessage}/>
        </div>
    );
}

export default Header;