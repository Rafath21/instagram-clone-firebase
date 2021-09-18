import { auth, storage, firestore } from "./firebase";
import firebase from "firebase/app";
import { Redirect } from "react-router-dom";
import "./App.css";
import Suggestions from "./Suggestions";
import { AuthContext } from "./AuthProvider";
import { useEffect, useContext, useState } from "react";
import Postcard from "./Postcard";
import { Link } from "react-router-dom";

let Home = (props) => {
  let [userName, setUserName] = useState("");
  let [pfpUrl, setpfpUrl] = useState("");
  let [reqOpen, setreqOpen] = useState(false);
  let [createBoxOpen, setcreateBoxOpen] = useState(false);
  let [allRequests, setRequests] = useState([]);
  let [typeOfAccount, settypeOfAccount] = useState("");
  let [uploadFilename, setuploadFilename] = useState("");
  let [uploadFilesize, setuploadFilesize] = useState("");
  let [uploadFiletype, setuploadFiletype] = useState("");
  let [uploadFile, setuploadFile] = useState("");
  let [uploadFileUrl, setUploadFileurl] = useState(null);
  let [uploadCaption, setuploadCaption] = useState("");
  let [feedPosts, setfeedPosts] = useState([]);
  let [searchValue, setsearchValue] = useState("");
  let [notificationCount, setnotificationCount] = useState("");
  let [allUsers, setallUsers] = useState([
    {
      uid: "",
      username: "",
      pfpUrl: "",
    },
  ]);
  let id = Date.now();
  let atHour = new Date().getHours(); //Hour at which the post was created
  console.log(atHour);
  let value = useContext(AuthContext);
  useEffect(async () => {
    let document = await firestore.collection("users").doc(value.uid).get();
    let creds = document.data();
    settypeOfAccount(creds.typeOfAccount);
    setUserName(creds.username);
    setpfpUrl(creds.photoURL);
  }, []);
  /*  useEffect(async () => {
    let querySnapshotReq = await firestore
      .collection("users")
      .doc(value.uid)
      .collection("requests")
      .get();
    let arr = [];
    querySnapshotReq.forEach((doc) => {
      arr.push(doc.data());
    });
    setRequests(arr);
    console.log(allRequests);
  }, []);*/
  useEffect(async () => {
    let unsubscription = firestore
      .collection("users")
      .doc(value.uid)
      .collection("requests")
      .onSnapshot((querySnapshot) => {
        setRequests(
          querySnapshot.docs.map((doc) => {
            return { ...doc.data() };
          })
        );
        setnotificationCount(querySnapshot.docs.length);
      });
    return () => {
      unsubscription();
    };
  }, []);

  useEffect(async () => {
    console.log("new use effect");
    let unsubscription = await firestore
      .collection("users")
      .doc(value.uid)
      .collection("feedItems")
      .onSnapshot((querySnapshot) => {
        setfeedPosts(
          querySnapshot.docs.map((doc) => {
            return { ...doc.data() };
          })
        );
      });
    return () => {
      unsubscription();
    };
  }, []);
  useEffect(async () => {
    let users = await firestore.collection("users").get();
    let arr = [];
    let obj = {};
    users.forEach((doc) => {
      console.log(doc.data());
      obj = {
        uid: doc.data().uid,
        username: doc.data().username,
        pfpUrl: doc.data().photoURL,
      };
      setallUsers((allUsers) => [...allUsers, obj]);
    });
    console.log(typeof allUsers);
  }, []);
  useEffect(() => {
    console.log(allUsers);
  });
  return (
    <div className="home-container">
      {value ? "" : <Redirect to="/register" />}
      <div className="home-header">
        <div className="home-header-title">Instagram-clone</div>
        <div className="header-search-box">
          <input
            className="header-search-input"
            type="text"
            placeholder="Search"
            onChange={(e) => {
              setsearchValue(e.target.value);
            }}
          />
          <i class="fas fa-search" id="search-icon"></i>
        </div>
        <div className="other-icons">
          <i
            class="far fa-plus-square"
            id="plus-icon"
            onClick={() => {
              if (createBoxOpen) setcreateBoxOpen(false);
              else setcreateBoxOpen(true);
            }}
          ></i>
          {createBoxOpen ? (
            <div className="create-post-container">
              <i
                class="far fa-times-circle"
                id="create-post-container-close"
                onClick={() => {
                  setcreateBoxOpen(false);
                }}
              ></i>
              <p className="create-post-heading">Create New Post</p>
              <input
                type="file"
                className="create-post-input"
                onClick={(e) => {
                  e.target.value = null;
                }}
                onChange={(e) => {
                  if (!e.target.files[0]) return;

                  setuploadFilename(e.target.files[0].name);
                  setuploadFilesize(e.target.files[0].size);
                  setuploadFiletype(e.target.files[0].type);
                  setuploadFile(e.target.files[0]);
                  uploadFiletype = uploadFiletype.split("/")[0];
                  console.log(uploadFiletype);
                  if (
                    uploadFiletype.localeCompare("image") != 0 &&
                    uploadFiletype.localeCompare("video") != 0
                  ) {
                    console.log(uploadFiletype);
                    alert("please select an image");
                  }
                }}
              />
              <p className="create-post-caption-heading">
                Write your caption here...
              </p>
              <textarea
                type="text"
                className="create-post-caption"
                onChange={(e) => {
                  let caption = e.currentTarget.value;
                  setuploadCaption(caption);
                }}
              ></textarea>
              <button
                className="create-new-post-btn"
                onClick={async (e) => {
                  e.preventDefault();
                  console.log(e);
                  e.target.innerText = "POSTED";
                  setcreateBoxOpen(false);
                  await firestore
                    .collection("users")
                    .doc(value.uid)
                    .collection("posts")
                    .doc(value.uid + "post" + id)
                    .set({
                      caption: uploadCaption,
                    });
                  console.log(uploadCaption);
                  let followers = []; //followers of the current follower
                  let querySnapshotfr = await firestore
                    .collection("users")
                    .doc(value.uid)
                    .collection("followers")
                    .get();
                  querySnapshotfr.forEach((doc) => {
                    followers.push(doc.data());
                  });
                  let f1 = (snapshot) => {
                    console.log(snapshot.bytesTransferred);
                    console.log(snapshot.totalBytes);
                  };
                  //f2 function passed to state_changed event for error handling
                  let f2 = (error) => {
                    console.log(error);
                  };
                  let f3 = () => {
                    let p = uploadPost.snapshot.ref.getDownloadURL();

                    p.then((url) => {
                      firestore
                        .collection("users")
                        .doc(value.uid)
                        .collection("posts")
                        .doc(value.uid + "post" + id)
                        .update({
                          hour: atHour,
                          postUrl: url,
                          comments: [],
                          likes: 0,
                          postId: value.uid + "post" + id,
                        });
                      setUploadFileurl(url);
                      console.log(url);
                      firestore
                        .collection("users")
                        .doc(value.uid)
                        .collection("feedItems")
                        .doc(value.uid + "post" + id)
                        .set({
                          hour: atHour,
                          feedItemurl: url,
                          postedBy: userName,
                          postedBypfp: pfpUrl,
                          postedCaption: uploadCaption,
                          likes: 0,
                          comments: [],
                          postId: value.uid + "post" + id,
                          postedByUid: value.uid,
                        });
                      followers.map(async (e) => {
                        await firestore
                          .collection("users")
                          .doc(e.ruid)
                          .collection("feedItems")
                          .doc(value.uid + "post" + id)
                          .set({
                            hour: atHour,
                            feedItemurl: url,
                            postedBy: userName,
                            postedBypfp: pfpUrl,
                            postedCaption: uploadCaption,
                            likes: 0,
                            comments: [],
                            postId: value.uid + "post" + id,
                            postedByUid: value.uid,
                          });
                        console.log("Successfully added");
                      });
                    });
                  };
                  await firestore
                    .collection("users")
                    .doc(value.uid)
                    .update({
                      postsCount: firebase.firestore.FieldValue.increment(1),
                    });

                  let uploadPost = storage
                    .ref(`/posts/${value.uid}/${Date.now() + uploadFilename}`)
                    .put(uploadFile);

                  uploadPost.on("clicked", f1, f2, f3);
                }}
              >
                POST
              </button>
            </div>
          ) : (
            ""
          )}
          <i class="fas fa-home" id="home-icon"></i>

          <Link
            to={{
              pathname: "/reels",
              state: {
                uid: value.uid,
              },
            }}
            style={{ textDecoration: "none" }}
          >
            <i class="fas fa-video" id="reels-icon"></i>
          </Link>
          <i
            class="fas fa-bell"
            id="requests-icon"
            onClick={() => {
              if (reqOpen) setreqOpen(false);
              else setreqOpen(true);
            }}
          ></i>
          <span className="notifications">{notificationCount}</span>
        </div>
      </div>

      {reqOpen ? (
        <div className="requests-container">
          {typeOfAccount == "private" ? (
            <>
              <div className="requests-heading">Follow Requests</div>
              <i
                class="fas fa-window-close"
                id="request-close-btn"
                onClick={() => {
                  setreqOpen(false);
                }}
              ></i>

              <div className="requests">
                {allRequests.map((request, index) => {
                  return (
                    <div key={index} className="requests-inner">
                      <img className="request-pfp" src={request.pfp} />
                      <p className="request-username">{request.name}</p>

                      <button
                        className="request-allow-btn"
                        onClick={async () => {
                          let deluid = "request" + request.ruid; //uid to be deleted from requests collection
                          await firestore //adding the user to current user's followers
                            .collection("users")
                            .doc(value.uid)
                            .collection("followers")
                            .doc(request.ruid)
                            .set({
                              name: request.name,
                              ruid: request.ruid,
                              pfp: request.pfp,
                            });
                          await firestore
                            .collection("users")
                            .doc(request.ruid)
                            .update({
                              followingCount:
                                firebase.firestore.FieldValue.increment(1),
                            });
                          await firestore
                            .collection("users")
                            .doc(value.uid)
                            .collection("requests")
                            .doc(deluid)
                            .delete();
                          await firestore
                            .collection("users")
                            .doc(value.uid)
                            .update({
                              followersCount:
                                firebase.firestore.FieldValue.increment(1),
                            });
                        }}
                      >
                        Allow
                      </button>
                      <i class="far fa-times-circle" id="request-close-btn"></i>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="follows-container">
                <div className="follows-container-follows-heading">
                  Activity
                </div>
                <i
                  class="fas fa-window-close"
                  id="request-container-close-btn"
                  onClick={() => {
                    setreqOpen(false);
                  }}
                ></i>
                {allRequests.map((request, index) => {
                  return (
                    <div key={index} className="follows-container-follows">
                      <div className="follows-container-inner-follows">
                        <img
                          src={request.pfp}
                          alt=""
                          className="follows-container-pfp"
                        />
                        <p className="follows-container-username">
                          {request.name}
                        </p>
                        <p className="follows-container-followingyou">
                          started following you
                        </p>
                        <i
                          class="far fa-times-circle"
                          id="follows-container-close"
                          onClick={(e) => {
                            console.log("request" + request.ruid);
                            firestore
                              .collection("users")
                              .doc(value.uid)
                              .collection("requests")
                              .doc("request" + request.ruid)
                              .delete();
                          }}
                        ></i>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ) : (
        ""
      )}
      <div class="stories-posts-sidebar-container">
        <div class="stories-posts-container">
          <div className="home-stories">
            <ul className="stories-container">
              <li className="story-list-item">
                <div className="story-list-div">
                  <img src="" />
                </div>
                <span class="story-username">Username</span>
              </li>
            </ul>
          </div>
          {feedPosts.length > 0 ? (
            <div className="home-posts">
              {feedPosts.map((post, index) => {
                console.log(post);
                return (
                  <Postcard
                    key={index}
                    post={post}
                    value={value}
                    username={userName}
                    pfpUrl={pfpUrl}
                  />
                );
              })}
            </div>
          ) : (
            <div className="no-posts-container">
              <p className="no-post-title">No Posts here!</p>
              <p className="no-post-matter">
                Please follow people on Instagram-clone to see posts.
              </p>
            </div>
          )}
        </div>
        <div className="home-sidebar">
          {value ? (
            <>
              <Suggestions
                username={userName}
                profilepic={pfpUrl}
                uid={value.uid}
              />
            </>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};
export default Home;