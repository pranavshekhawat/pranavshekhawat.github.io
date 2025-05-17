<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { data } from './works.js';
import Projects from './Projects.jsx';
import BasicBreadcrumbs from './BreadCrumbs/Breadcrumb_home_projects';
import Headingbartype2 from './Components/Headingbartype2/Headingbartype2';
import Imagetop from './Components/Imagebox/Imgtop';
import Imagebottom from './Components/Imagebox/Imgbottom';
import Bookmarkbar from "./Components/Bookmarkbar/Bookmarkbar";
import Des from "./Components/Descriptionbox/Des";
import Navbar from './Navbar';
import { TabTitle } from './utils/GeneralFunctions';
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./utils/firebase-config";
// import { getAuth } from "firebase/auth";
import './css/likes.css';
import { NavHashLink } from 'react-router-hash-link';


function Workpage() {
    const { url } = useParams();
    const [list, setList] = useState(null);
    const [isHovering, setisHovering] = useState(false);
    const [isHovering2, setisHovering2] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [likedByUser, setLikedByUser] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editedComment, setEditedComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [offlineError, setOfflineError] = useState(false);
    const [showLoginMessageLike, setShowLoginMessageLike] = useState(false);
    const [showLoginMessageComment, setShowLoginMessageComment] = useState(false);
    const [fetchError, setFetchError] = useState('');



    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'long' };
        return date.toLocaleString('default', options);
    };

    useEffect(() => {
        const list = data.find((list) => list.title.toLowerCase().replace(/ /g, "_") === url);
        TabTitle(`Pranav Shekhawat - ${list.title}`);
        setList(list);
    }, [url]);

    useEffect(() => {
        try {
            const fetchLikesAndComments = async () => {
                try {
                    const likesDocRef = doc(db, "likes", url);
                    const likesDocSnap = await getDoc(likesDocRef);

                    if (likesDocSnap.exists()) {
                        const likesData = likesDocSnap.data();
                        const likedByUser = (likesData.likedby && likesData.likedby[auth.currentUser?.uid]) || false;
                        const likesCount = likesData.totallikes || 0;

                        setLikedByUser(likedByUser);
                        setLikesCount(likesCount);
                    } else {
                        setLikedByUser(false);
                        setLikesCount(0);
                    }

                    const commentsDocRef = doc(db, "comments", url);
                    const commentsDocSnap = await getDoc(commentsDocRef);
                    if (commentsDocSnap.exists()) {
                        const commentsData = commentsDocSnap.data();
                        const comments = commentsData.comments || [];

                        // Fetch user data for each comment
                        const commentsWithUserDataPromises = comments.map(async (comment) => {
                            const userDocRef = doc(db, "users", comment.user);
                            const userDocSnap = await getDoc(userDocRef);
                            if (userDocSnap.exists()) {
                                const userData = userDocSnap.data();
                                return {
                                    ...comment,
                                    userName: userData.userName,
                                };
                            }
                            return comment;
                        });

                        const commentsWithUserData = await Promise.all(commentsWithUserDataPromises);

                        setComments(commentsWithUserData);
                    } else {
                        setComments([]);
                    }
                } catch (error) {
                    if (error.code === 'offline') {
                        setOfflineError(true);
                    } else {
                        // Handle other errors
                        console.log('Error:', error);
                    }
                }
            };
            setFetchError('');
            fetchLikesAndComments();
            setShowLoginMessageLike(false);
            setShowLoginMessageComment(false);
        } catch (error) {
            if (error.code === 'offline') {
                setOfflineError(true);
            } else {
                // Handle other errors
                console.log('Error:', error);
                // Set the fetch error message
                setFetchError('Failed to fetch comments. Please try again later.');
            }
        }
    }, [url]);

    const handleLikeClick = async () => {
        if (!auth.currentUser) {
            // Display a message to log in or sign up
            setShowLoginMessageLike(true);
            return;
        }
        try {
            const likesDocRef = doc(db, "likes", url);
            const likesDocSnap = await getDoc(likesDocRef);

            if (likesDocSnap.exists()) {
                const likesData = likesDocSnap.data();
                const likedByUser = likesData.likedby && !!likesData.likedby[auth.currentUser.uid];
                const newLikesCount = likedByUser ? likesData.totallikes - 1 : likesData.totallikes + 1;

                await updateDoc(likesDocRef, {
                    [`likedby.${auth.currentUser.uid}`]: !likedByUser || null,
                    totallikes: newLikesCount,
                });

                setLikedByUser(!likedByUser);
                setLikesCount(newLikesCount);

            } else {
                const newLikesData = {
                    likedby: {
                        [auth.currentUser.uid]: true,
                    },
                    totallikes: 1,
                };

                await setDoc(likesDocRef, newLikesData);
                setLikedByUser(true);
                setLikesCount(1);
            }
        } catch (error) {
            if (error.message === 'Failed to fetch' || error.message === 'TypeError: Failed to fetch') {
                setOfflineError(true);
            } else {
                // Handle other errors
                console.log('Error:', error);
            }
        }
    };

    const handleCommentSubmit = async () => {
        if (!auth.currentUser) {
            // Display a message to log in or sign up
            setShowLoginMessageComment(true);
            return;
        }

        if (newComment.trim() === '') {
            return;
        }
        try {
            const commentsDocRef = doc(db, 'comments', url);
            const commentsDocSnap = await getDoc(commentsDocRef);
            if (commentsDocSnap.exists()) {
                const commentsData = commentsDocSnap.data();
                const comments = commentsData.comments || [];

                // Fetch user data for the new comment
                const userDocRef = doc(db, 'users', auth.currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const newCommentWithUserData = {
                        id: Date.now().toString(),
                        user: auth.currentUser.uid,
                        comment: newComment,
                        date: new Date().toLocaleString('en-US', {
                            day: 'numeric',
                            month: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            second: 'numeric',
                        }),
                        userName: userData.userName,
                    };

                    const newComments = [...comments, newCommentWithUserData];

                    await updateDoc(commentsDocRef, {
                        comments: newComments,
                    });

                    setComments(newComments);
                    setNewComment('');
                }
            } else {
                // Handle the case when comments collection doesn't exist
                // setShowLoginMessage(false);
                setShowLoginMessageLike(false);
                setShowLoginMessageComment(false);
                const userDocRef = doc(db, 'users', auth.currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const newCommentsData = {
                        comments: [
                            {
                                id: Date.now().toString(),
                                user: auth.currentUser.uid,
                                comment: newComment,
                                date: new Date().toLocaleString(),
                                userName: userData.userName,
                            },
                        ],
                    };

                    await setDoc(commentsDocRef, newCommentsData);
                    setComments(newCommentsData.comments);
                    setNewComment('');
                }
            }
        } catch (error) {
            if (error.message === 'Failed to fetch' || error.message === 'TypeError: Failed to fetch') {
                setOfflineError(true);
            } else {
                // Handle other errors
                console.log('Error:', error);
            }
        }
    };



    const handleCommentEdit = (commentId, comment) => {
        setEditMode(true);
        setEditedComment(comment);
        setEditingCommentId(commentId);
    };

    const handleCommentSave = async () => {
        if (editedComment.trim() === '') {
            return;
        }

        const updatedComments = comments.map((comment) => {
            if (comment.id === editingCommentId) {
                return {
                    ...comment,
                    comment: editedComment,
                };
            }
            return comment;
        });

        const commentsDocRef = doc(db, "comments", url);
        await updateDoc(commentsDocRef, {
            comments: updatedComments,
        });

        setComments(updatedComments);
        setEditMode(false);
        setEditedComment('');
        setEditingCommentId(null);
    };

    const handleCommentDelete = async (commentId) => {
        const updatedComments = comments.filter((comment) => comment.id !== commentId);

        const commentsDocRef = doc(db, "comments", url);
        await updateDoc(commentsDocRef, {
            comments: updatedComments,
        });

        setComments(updatedComments);
    };

    if (!list) {
        return <Projects />;
    }

    const { index, title, topimg, body, category, bookmarks, description, bottomimg } = list;

    const prevWork = data.find((list) => list.index === index - 1);
    const nextWork = data.find((list) => list.index === index + 1);

    function fillcolour() {
        return `more_arrow_right ${isHovering ? "more_fillcolor" : "more_fillwhite"} `;
    }

    function fillcolour2() {
        return `more_arrow_right_2 ${isHovering2 ? "more_fillcolor" : "more_fillwhite"} `;
    }

    return (
        <>
            <Navbar />

            <div className="blog-wrap">
                <BasicBreadcrumbs text={title} theme="light" />
                <Headingbartype2 heading={title} theme="light" category={category} />

                <Bookmarkbar bookmarks={bookmarks} />
                <Imagetop src={topimg} />
                <Des desc={description} />

                <section className="grey">{body}</section>

                <div className=" grid_container_25 dark">
                    <div className="colstart3 colend24">

                        <div className='like-panel' >
                            <button className='like-button' onClick={handleLikeClick}>{likedByUser ? <svg className='unlike' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="9" fill="#ffffff" /><path d="M23.873 9.81c.086-.251.127-.508.127-.763 0-.77-.379-1.514-1.055-1.982-2.152-1.492-1.868-1.117-2.68-3.544-.339-1.014-1.321-1.7-2.429-1.696-2.654.008-2.193.153-4.335-1.354-.446-.314-.974-.471-1.501-.471s-1.055.157-1.502.471c-2.154 1.515-1.687 1.362-4.335 1.354-1.107-.003-2.09.683-2.429 1.696-.812 2.433-.533 2.055-2.68 3.544-.675.469-1.054 1.212-1.054 1.982 0 .255.041.512.127.763.83 2.428.827 1.963 0 4.38-.086.251-.127.509-.127.763 0 .77.379 1.514 1.055 1.982 2.147 1.489 1.869 1.114 2.68 3.544.339 1.014 1.321 1.7 2.429 1.696 2.654-.009 2.193-.152 4.335 1.354.446.314.974.471 1.501.471s1.055-.157 1.502-.471c2.141-1.506 1.681-1.362 4.335-1.354 1.107.003 2.09-.683 2.429-1.696.812-2.428.528-2.053 2.68-3.544.675-.468 1.054-1.212 1.054-1.982 0-.254-.041-.512-.127-.763-.831-2.427-.827-1.963 0-4.38zm-7.565 1.984c.418.056.63.328.63.61 0 .323-.277.66-.844.705-.348.027-.434.312-.016.406.351.08.549.326.549.591 0 .314-.279.654-.913.771-.383.07-.421.445-.016.477.344.026.479.146.479.312 0 .466-.826 1.333-2.426 1.333-2.501.001-3.407-1.499-6.751-1.499v-4.964c1.766-.271 3.484-.817 4.344-3.802.239-.831.39-1.734 1.187-1.734 1.188 0 1.297 2.562.844 4.391.656.344 1.875.468 2.489.442.886-.036 1.136.409 1.136.745 0 .505-.416.675-.677.755-.304.094-.444.404-.015.461z" />

                            </svg>
                                : <svg className='like' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#ffffff" /><path d="M23.873 9.81c.086-.251.127-.508.127-.763 0-.77-.379-1.514-1.055-1.982-2.152-1.492-1.868-1.117-2.68-3.544-.339-1.014-1.321-1.7-2.429-1.696-2.654.008-2.193.153-4.335-1.354-.446-.314-.974-.471-1.501-.471s-1.055.157-1.502.471c-2.154 1.515-1.687 1.362-4.335 1.354-1.107-.003-2.09.683-2.429 1.696-.812 2.433-.533 2.055-2.68 3.544-.675.469-1.054 1.212-1.054 1.982 0 .255.041.512.127.763.83 2.428.827 1.963 0 4.38-.086.251-.127.509-.127.763 0 .77.379 1.514 1.055 1.982 2.147 1.489 1.869 1.114 2.68 3.544.339 1.014 1.321 1.7 2.429 1.696 2.654-.009 2.193-.152 4.335 1.354.446.314.974.471 1.501.471s1.055-.157 1.502-.471c2.141-1.506 1.681-1.362 4.335-1.354 1.107.003 2.09-.683 2.429-1.696.812-2.428.528-2.053 2.68-3.544.675-.468 1.054-1.212 1.054-1.982 0-.254-.041-.512-.127-.763-.831-2.427-.827-1.963 0-4.38zm-7.565 1.984c.418.056.63.328.63.61 0 .323-.277.66-.844.705-.348.027-.434.312-.016.406.351.08.549.326.549.591 0 .314-.279.654-.913.771-.383.07-.421.445-.016.477.344.026.479.146.479.312 0 .466-.826 1.333-2.426 1.333-2.501.001-3.407-1.499-6.751-1.499v-4.964c1.766-.271 3.484-.817 4.344-3.802.239-.831.39-1.734 1.187-1.734 1.188 0 1.297 2.562.844 4.391.656.344 1.875.468 2.489.442.886-.036 1.136.409 1.136.745 0 .505-.416.675-.677.755-.304.094-.444.404-.015.461z" /></svg>}</button>

                            <span>{likesCount} {likesCount > 1 || likesCount === 0 ? "Likes" : "Like"}</span>
                            {showLoginMessageLike && <div>Please <NavHashLink className={'linkbtn'} to="/#signin">log in or sign up</NavHashLink> to like this post.</div>}
                        </div>
                        <hr />
                        <div>
                            {comments.map((comment) => (
                                <div key={comment.id}>

                                    <div>
                                        <span className='comment'>{comment.comment}, </span>
                                        <span>{comment.userName}. </span>
                                        <span>{formatDate(comment.date)}</span>
                                        <br />
                                        {auth.currentUser && comment.user === auth.currentUser.uid && (
                                            <>
                                                {!editMode && (
                                                    <>
                                                        <button className='commmetedit' onClick={() => handleCommentEdit(comment.id, comment.comment)}>Edit</button>
                                                        <span> • </span>
                                                        <button className='commmetdelete' onClick={() => handleCommentDelete(comment.id)}> Delete</button>
                                                    </>
                                                )}
                                                {editMode && editingCommentId === comment.id && (
                                                    <>
                                                        <input className='editedcomment' type="text" value={editedComment} onChange={(e) => setEditedComment(e.target.value)} />
                                                        <span> </span>
                                                        <button className='commentsave' onClick={handleCommentSave}>Save</button>
                                                    </>
                                                )}

                                            </>
                                        )}
                                        <hr />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className='newcommentpanel'>
                            <input className='newcomment' type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment" />
                            <br />
                            <button className='commentsubmit' onClick={handleCommentSubmit}>Submit</button>
                            {offlineError && (
                                <div className="error-message">Failed to get document because the client is offline. Please check your internet connection and try again.</div>
                            )}
                            &nbsp;  &nbsp;
                            {showLoginMessageComment && <span> Please <NavHashLink className={'linkbtn'} to="/#signin">log in or sign up</NavHashLink> to comment on this post.</span>} {fetchError && <span className="error-message">{fetchError}</span>}
                        </div>
                        <br />
                        <br />
                    </div></div>

                <Imagebottom src={bottomimg} />

                <div className="grid_container_25">
                    <div className="colstart2 colend25">
                        <div className="more_work">
                            <section className="more_worklist">
                                {prevWork && (
                                    <Link to={`/projects/${prevWork.title.toLowerCase().replace(/ /g, "_")}`}>
                                        <article
                                            className="more_work"
                                            onMouseEnter={() => setisHovering(true)}
                                            onMouseLeave={() => setisHovering(false)}
                                        >
                                            <div className="more_work_img_div">
                                                <img src={prevWork.topimg} alt="" />
                                            </div>

                                            <div className="more_plate">
                                                <p className="more_category">
                                                    {prevWork.category.charAt(0).toUpperCase() + prevWork.category.slice(1)}
                                                </p>
                                                <svg className={fillcolour()} viewBox="0 0 24 24" aria-hidden="true">
                                                    <path
                                                        style={{
                                                            rotate: "180deg",
                                                            transform: "translateX(-24px) translateY(-26px)",
                                                        }}
                                                        d="M17.6881 11.8729C17.1238 11.2118 16.5347 10.2542 15.9208 9H16.9901C18.2475 10.4583 19.5842 11.5375 21 12.2375V12.7625C19.5842 13.4625 18.2475 14.5417 16.9901 16H15.9208C16.5347 14.7458 17.1238 13.7882 17.6881 13.1271H3V11.8729H17.6881Z"
                                                    ></path>
                                                </svg>
                                                <p className="more_title">{prevWork.title}</p>
                                            </div>
                                        </article>
                                    </Link>
                                )}
                                {nextWork && (
                                    <Link to={`/projects/${nextWork.title.toLowerCase().replace(/ /g, "_")}`}>
                                        <article
                                            className="more_work_2"
                                            onMouseEnter={() => setisHovering2(true)}
                                            onMouseLeave={() => setisHovering2(false)}
                                        >
                                            <div className="more_work_img_div">
                                                <img src={nextWork.topimg} alt="" />
                                            </div>

                                            <div className="more_plate">
                                                <p className="more_category">
                                                    {nextWork.category.charAt(0).toUpperCase() + nextWork.category.slice(1)}
                                                </p>
                                                <svg className={fillcolour2()} viewBox="0 0 24 24" aria-hidden="true">
                                                    <path
                                                        d="M17.6881 11.8729C17.1238 11.2118 16.5347 10.2542 15.9208 9H16.9901C18.2475 10.4583 19.5842 11.5375 21 12.2375V12.7625C19.5842 13.4625 18.2475 14.5417 16.9901 16H15.9208C16.5347 14.7458 17.1238 13.7882 17.6881 13.1271H3V11.8729H17.6881Z"
                                                    ></path>
                                                </svg>
                                                <p className="more_title">{nextWork.title}</p>
                                            </div>
                                        </article>
                                    </Link>
                                )}
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Workpage;
=======
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { data } from './works.js';
import Projects from './Projects.jsx';
import BasicBreadcrumbs from './BreadCrumbs/Breadcrumb_home_projects';
import Headingbartype2 from './Components/Headingbartype2/Headingbartype2';
import Imagetop from './Components/Imagebox/Imgtop';
import Imagebottom from './Components/Imagebox/Imgbottom';
import Bookmarkbar from "./Components/Bookmarkbar/Bookmarkbar";
import Des from "./Components/Descriptionbox/Des";
import Navbar from './Navbar';
import { TabTitle } from './utils/GeneralFunctions';
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./utils/firebase-config";
// import { getAuth } from "firebase/auth";
import './css/likes.css';
import { NavHashLink } from 'react-router-hash-link';


function Workpage() {
    const { url } = useParams();
    const [list, setList] = useState(null);
    const [isHovering, setisHovering] = useState(false);
    const [isHovering2, setisHovering2] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [likedByUser, setLikedByUser] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editedComment, setEditedComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [offlineError, setOfflineError] = useState(false);
    const [showLoginMessageLike, setShowLoginMessageLike] = useState(false);
    const [showLoginMessageComment, setShowLoginMessageComment] = useState(false);
    const [fetchError, setFetchError] = useState('');



    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'long' };
        return date.toLocaleString('default', options);
    };

    useEffect(() => {
        const list = data.find((list) => list.title.toLowerCase().replace(/ /g, "_") === url);
        TabTitle(`Pranav Shekhawat - ${list.title}`);
        setList(list);
    }, [url]);

    useEffect(() => {
        try {
            const fetchLikesAndComments = async () => {
                try {
                    const likesDocRef = doc(db, "likes", url);
                    const likesDocSnap = await getDoc(likesDocRef);

                    if (likesDocSnap.exists()) {
                        const likesData = likesDocSnap.data();
                        const likedByUser = (likesData.likedby && likesData.likedby[auth.currentUser?.uid]) || false;
                        const likesCount = likesData.totallikes || 0;

                        setLikedByUser(likedByUser);
                        setLikesCount(likesCount);
                    } else {
                        setLikedByUser(false);
                        setLikesCount(0);
                    }

                    const commentsDocRef = doc(db, "comments", url);
                    const commentsDocSnap = await getDoc(commentsDocRef);
                    if (commentsDocSnap.exists()) {
                        const commentsData = commentsDocSnap.data();
                        const comments = commentsData.comments || [];

                        // Fetch user data for each comment
                        const commentsWithUserDataPromises = comments.map(async (comment) => {
                            const userDocRef = doc(db, "users", comment.user);
                            const userDocSnap = await getDoc(userDocRef);
                            if (userDocSnap.exists()) {
                                const userData = userDocSnap.data();
                                return {
                                    ...comment,
                                    userName: userData.userName,
                                };
                            }
                            return comment;
                        });

                        const commentsWithUserData = await Promise.all(commentsWithUserDataPromises);

                        setComments(commentsWithUserData);
                    } else {
                        setComments([]);
                    }
                } catch (error) {
                    if (error.code === 'offline') {
                        setOfflineError(true);
                    } else {
                        // Handle other errors
                        console.log('Error:', error);
                    }
                }
            };
            setFetchError('');
            fetchLikesAndComments();
            setShowLoginMessageLike(false);
            setShowLoginMessageComment(false);
        } catch (error) {
            if (error.code === 'offline') {
                setOfflineError(true);
            } else {
                // Handle other errors
                console.log('Error:', error);
                // Set the fetch error message
                setFetchError('Failed to fetch comments. Please try again later.');
            }
        }
    }, [url]);

    const handleLikeClick = async () => {
        if (!auth.currentUser) {
            // Display a message to log in or sign up
            setShowLoginMessageLike(true);
            return;
        }
        try {
            const likesDocRef = doc(db, "likes", url);
            const likesDocSnap = await getDoc(likesDocRef);

            if (likesDocSnap.exists()) {
                const likesData = likesDocSnap.data();
                const likedByUser = likesData.likedby && !!likesData.likedby[auth.currentUser.uid];
                const newLikesCount = likedByUser ? likesData.totallikes - 1 : likesData.totallikes + 1;

                await updateDoc(likesDocRef, {
                    [`likedby.${auth.currentUser.uid}`]: !likedByUser || null,
                    totallikes: newLikesCount,
                });

                setLikedByUser(!likedByUser);
                setLikesCount(newLikesCount);

            } else {
                const newLikesData = {
                    likedby: {
                        [auth.currentUser.uid]: true,
                    },
                    totallikes: 1,
                };

                await setDoc(likesDocRef, newLikesData);
                setLikedByUser(true);
                setLikesCount(1);
            }
        } catch (error) {
            if (error.message === 'Failed to fetch' || error.message === 'TypeError: Failed to fetch') {
                setOfflineError(true);
            } else {
                // Handle other errors
                console.log('Error:', error);
            }
        }
    };

    const handleCommentSubmit = async () => {
        if (!auth.currentUser) {
            // Display a message to log in or sign up
            setShowLoginMessageComment(true);
            return;
        }

        if (newComment.trim() === '') {
            return;
        }
        try {
            const commentsDocRef = doc(db, 'comments', url);
            const commentsDocSnap = await getDoc(commentsDocRef);
            if (commentsDocSnap.exists()) {
                const commentsData = commentsDocSnap.data();
                const comments = commentsData.comments || [];

                // Fetch user data for the new comment
                const userDocRef = doc(db, 'users', auth.currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const newCommentWithUserData = {
                        id: Date.now().toString(),
                        user: auth.currentUser.uid,
                        comment: newComment,
                        date: new Date().toLocaleString('en-US', {
                            day: 'numeric',
                            month: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            second: 'numeric',
                        }),
                        userName: userData.userName,
                    };

                    const newComments = [...comments, newCommentWithUserData];

                    await updateDoc(commentsDocRef, {
                        comments: newComments,
                    });

                    setComments(newComments);
                    setNewComment('');
                }
            } else {
                // Handle the case when comments collection doesn't exist
                // setShowLoginMessage(false);
                setShowLoginMessageLike(false);
                setShowLoginMessageComment(false);
                const userDocRef = doc(db, 'users', auth.currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const newCommentsData = {
                        comments: [
                            {
                                id: Date.now().toString(),
                                user: auth.currentUser.uid,
                                comment: newComment,
                                date: new Date().toLocaleString(),
                                userName: userData.userName,
                            },
                        ],
                    };

                    await setDoc(commentsDocRef, newCommentsData);
                    setComments(newCommentsData.comments);
                    setNewComment('');
                }
            }
        } catch (error) {
            if (error.message === 'Failed to fetch' || error.message === 'TypeError: Failed to fetch') {
                setOfflineError(true);
            } else {
                // Handle other errors
                console.log('Error:', error);
            }
        }
    };



    const handleCommentEdit = (commentId, comment) => {
        setEditMode(true);
        setEditedComment(comment);
        setEditingCommentId(commentId);
    };

    const handleCommentSave = async () => {
        if (editedComment.trim() === '') {
            return;
        }

        const updatedComments = comments.map((comment) => {
            if (comment.id === editingCommentId) {
                return {
                    ...comment,
                    comment: editedComment,
                };
            }
            return comment;
        });

        const commentsDocRef = doc(db, "comments", url);
        await updateDoc(commentsDocRef, {
            comments: updatedComments,
        });

        setComments(updatedComments);
        setEditMode(false);
        setEditedComment('');
        setEditingCommentId(null);
    };

    const handleCommentDelete = async (commentId) => {
        const updatedComments = comments.filter((comment) => comment.id !== commentId);

        const commentsDocRef = doc(db, "comments", url);
        await updateDoc(commentsDocRef, {
            comments: updatedComments,
        });

        setComments(updatedComments);
    };

    if (!list) {
        return <Projects />;
    }

    const { index, title, topimg, body, category, bookmarks, description, bottomimg } = list;

    const prevWork = data.find((list) => list.index === index - 1);
    const nextWork = data.find((list) => list.index === index + 1);

    function fillcolour() {
        return `more_arrow_right ${isHovering ? "more_fillcolor" : "more_fillwhite"} `;
    }

    function fillcolour2() {
        return `more_arrow_right_2 ${isHovering2 ? "more_fillcolor" : "more_fillwhite"} `;
    }

    return (
        <>
            <Navbar />

            <div className="blog-wrap">
                <BasicBreadcrumbs text={title} theme="light" />
                <Headingbartype2 heading={title} theme="light" category={category} />

                <Bookmarkbar bookmarks={bookmarks} />
                <Imagetop src={topimg} />
                <Des desc={description} />

                <section className="grey">{body}</section>

                <div className=" grid_container_25 dark">
                    <div className="colstart3 colend24">

                        <div className='like-panel' >
                            <button className='like-button' onClick={handleLikeClick}>{likedByUser ? <svg className='unlike' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="9" fill="#ffffff" /><path d="M23.873 9.81c.086-.251.127-.508.127-.763 0-.77-.379-1.514-1.055-1.982-2.152-1.492-1.868-1.117-2.68-3.544-.339-1.014-1.321-1.7-2.429-1.696-2.654.008-2.193.153-4.335-1.354-.446-.314-.974-.471-1.501-.471s-1.055.157-1.502.471c-2.154 1.515-1.687 1.362-4.335 1.354-1.107-.003-2.09.683-2.429 1.696-.812 2.433-.533 2.055-2.68 3.544-.675.469-1.054 1.212-1.054 1.982 0 .255.041.512.127.763.83 2.428.827 1.963 0 4.38-.086.251-.127.509-.127.763 0 .77.379 1.514 1.055 1.982 2.147 1.489 1.869 1.114 2.68 3.544.339 1.014 1.321 1.7 2.429 1.696 2.654-.009 2.193-.152 4.335 1.354.446.314.974.471 1.501.471s1.055-.157 1.502-.471c2.141-1.506 1.681-1.362 4.335-1.354 1.107.003 2.09-.683 2.429-1.696.812-2.428.528-2.053 2.68-3.544.675-.468 1.054-1.212 1.054-1.982 0-.254-.041-.512-.127-.763-.831-2.427-.827-1.963 0-4.38zm-7.565 1.984c.418.056.63.328.63.61 0 .323-.277.66-.844.705-.348.027-.434.312-.016.406.351.08.549.326.549.591 0 .314-.279.654-.913.771-.383.07-.421.445-.016.477.344.026.479.146.479.312 0 .466-.826 1.333-2.426 1.333-2.501.001-3.407-1.499-6.751-1.499v-4.964c1.766-.271 3.484-.817 4.344-3.802.239-.831.39-1.734 1.187-1.734 1.188 0 1.297 2.562.844 4.391.656.344 1.875.468 2.489.442.886-.036 1.136.409 1.136.745 0 .505-.416.675-.677.755-.304.094-.444.404-.015.461z" />

                            </svg>
                                : <svg className='like' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#ffffff" /><path d="M23.873 9.81c.086-.251.127-.508.127-.763 0-.77-.379-1.514-1.055-1.982-2.152-1.492-1.868-1.117-2.68-3.544-.339-1.014-1.321-1.7-2.429-1.696-2.654.008-2.193.153-4.335-1.354-.446-.314-.974-.471-1.501-.471s-1.055.157-1.502.471c-2.154 1.515-1.687 1.362-4.335 1.354-1.107-.003-2.09.683-2.429 1.696-.812 2.433-.533 2.055-2.68 3.544-.675.469-1.054 1.212-1.054 1.982 0 .255.041.512.127.763.83 2.428.827 1.963 0 4.38-.086.251-.127.509-.127.763 0 .77.379 1.514 1.055 1.982 2.147 1.489 1.869 1.114 2.68 3.544.339 1.014 1.321 1.7 2.429 1.696 2.654-.009 2.193-.152 4.335 1.354.446.314.974.471 1.501.471s1.055-.157 1.502-.471c2.141-1.506 1.681-1.362 4.335-1.354 1.107.003 2.09-.683 2.429-1.696.812-2.428.528-2.053 2.68-3.544.675-.468 1.054-1.212 1.054-1.982 0-.254-.041-.512-.127-.763-.831-2.427-.827-1.963 0-4.38zm-7.565 1.984c.418.056.63.328.63.61 0 .323-.277.66-.844.705-.348.027-.434.312-.016.406.351.08.549.326.549.591 0 .314-.279.654-.913.771-.383.07-.421.445-.016.477.344.026.479.146.479.312 0 .466-.826 1.333-2.426 1.333-2.501.001-3.407-1.499-6.751-1.499v-4.964c1.766-.271 3.484-.817 4.344-3.802.239-.831.39-1.734 1.187-1.734 1.188 0 1.297 2.562.844 4.391.656.344 1.875.468 2.489.442.886-.036 1.136.409 1.136.745 0 .505-.416.675-.677.755-.304.094-.444.404-.015.461z" /></svg>}</button>

                            <span>{likesCount} {likesCount > 1 || likesCount === 0 ? "Likes" : "Like"}</span>
                            {showLoginMessageLike && <div>Please <NavHashLink className={'linkbtn'} to="/#signin">log in or sign up</NavHashLink> to like this post.</div>}
                        </div>
                        <hr />
                        <div>
                            {comments.map((comment) => (
                                <div key={comment.id}>

                                    <div>
                                        <span className='comment'>{comment.comment}, </span>
                                        <span>{comment.userName}. </span>
                                        <span>{formatDate(comment.date)}</span>
                                        <br />
                                        {auth.currentUser && comment.user === auth.currentUser.uid && (
                                            <>
                                                {!editMode && (
                                                    <>
                                                        <button className='commmetedit' onClick={() => handleCommentEdit(comment.id, comment.comment)}>Edit</button>
                                                        <span> • </span>
                                                        <button className='commmetdelete' onClick={() => handleCommentDelete(comment.id)}> Delete</button>
                                                    </>
                                                )}
                                                {editMode && editingCommentId === comment.id && (
                                                    <>
                                                        <input className='editedcomment' type="text" value={editedComment} onChange={(e) => setEditedComment(e.target.value)} />
                                                        <span> </span>
                                                        <button className='commentsave' onClick={handleCommentSave}>Save</button>
                                                    </>
                                                )}

                                            </>
                                        )}
                                        <hr />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className='newcommentpanel'>
                            <input className='newcomment' type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment" />
                            <br />
                            <button className='commentsubmit' onClick={handleCommentSubmit}>Submit</button>
                            {offlineError && (
                                <div className="error-message">Failed to get document because the client is offline. Please check your internet connection and try again.</div>
                            )}
                            &nbsp;  &nbsp;
                            {showLoginMessageComment && <span> Please <NavHashLink className={'linkbtn'} to="/#signin">log in or sign up</NavHashLink> to comment on this post.</span>} {fetchError && <span className="error-message">{fetchError}</span>}
                        </div>
                        <br />
                        <br />
                    </div></div>

                <Imagebottom src={bottomimg} />

                <div className="grid_container_25">
                    <div className="colstart2 colend25">
                        <div className="more_work">
                            <section className="more_worklist">
                                {prevWork && (
                                    <Link to={`/projects/${prevWork.title.toLowerCase().replace(/ /g, "_")}`}>
                                        <article
                                            className="more_work"
                                            onMouseEnter={() => setisHovering(true)}
                                            onMouseLeave={() => setisHovering(false)}
                                        >
                                            <div className="more_work_img_div">
                                                <img src={prevWork.topimg} alt="" />
                                            </div>

                                            <div className="more_plate">
                                                <p className="more_category">
                                                    {prevWork.category.charAt(0).toUpperCase() + prevWork.category.slice(1)}
                                                </p>
                                                <svg className={fillcolour()} viewBox="0 0 24 24" aria-hidden="true">
                                                    <path
                                                        style={{
                                                            rotate: "180deg",
                                                            transform: "translateX(-24px) translateY(-26px)",
                                                        }}
                                                        d="M17.6881 11.8729C17.1238 11.2118 16.5347 10.2542 15.9208 9H16.9901C18.2475 10.4583 19.5842 11.5375 21 12.2375V12.7625C19.5842 13.4625 18.2475 14.5417 16.9901 16H15.9208C16.5347 14.7458 17.1238 13.7882 17.6881 13.1271H3V11.8729H17.6881Z"
                                                    ></path>
                                                </svg>
                                                <p className="more_title">{prevWork.title}</p>
                                            </div>
                                        </article>
                                    </Link>
                                )}
                                {nextWork && (
                                    <Link to={`/projects/${nextWork.title.toLowerCase().replace(/ /g, "_")}`}>
                                        <article
                                            className="more_work_2"
                                            onMouseEnter={() => setisHovering2(true)}
                                            onMouseLeave={() => setisHovering2(false)}
                                        >
                                            <div className="more_work_img_div">
                                                <img src={nextWork.topimg} alt="" />
                                            </div>

                                            <div className="more_plate">
                                                <p className="more_category">
                                                    {nextWork.category.charAt(0).toUpperCase() + nextWork.category.slice(1)}
                                                </p>
                                                <svg className={fillcolour2()} viewBox="0 0 24 24" aria-hidden="true">
                                                    <path
                                                        d="M17.6881 11.8729C17.1238 11.2118 16.5347 10.2542 15.9208 9H16.9901C18.2475 10.4583 19.5842 11.5375 21 12.2375V12.7625C19.5842 13.4625 18.2475 14.5417 16.9901 16H15.9208C16.5347 14.7458 17.1238 13.7882 17.6881 13.1271H3V11.8729H17.6881Z"
                                                    ></path>
                                                </svg>
                                                <p className="more_title">{nextWork.title}</p>
                                            </div>
                                        </article>
                                    </Link>
                                )}
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Workpage;
>>>>>>> b4b4bc20d0426045ab9c3733a0f91ede447c11c5
