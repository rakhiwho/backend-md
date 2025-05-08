import express from "express";
import { delete_convo, getFunction, sendFunction } from "../Controllers/message.js";
import { change_user_privacy, get_loggedIn_User, login , logout, register} from "../Controllers/user.js";
import { verifyToken } from "../Controllers/authorization.js";
import { getusers } from "../Controllers/user.js";
import  {upload, uploadPost} from '../utility/multer.js'
import { editInfo, Uplaod_Story  , get_Story} from "../Controllers/info_changing.js";
import { delete_Story, deleteMassege, deleteUser } from "../Controllers/deleteMethods.js";
import { Add_comments, allPost, delete_post, edit_post, exploreGetPost, get_comment, get_post, likes, post } from "../Controllers/post.js";
import { follow, friends, get_following_followers, userInfo } from "../Controllers/user_Activity.js";


const  router = express.Router();

//   authentication
router.post('/register' , register )
router.post('/login' , login )
router.post('/send/:id',  verifyToken, sendFunction)
 
// operating 
router.get('/',verifyToken  , getusers)
router.get('/get/:id', verifyToken , getFunction)
router.get('/userProfile' , verifyToken , get_loggedIn_User);
router.get('/getUsers', verifyToken , friends )
router.get('/userInfo/:id', verifyToken , userInfo )
router.post('/logout' , verifyToken , logout);
// updating 
router.put('/editProfile' , verifyToken , upload.single('profilePic') , editInfo )
router.put('/add-story' , verifyToken , Uplaod_Story);
router.get('/getStory/:id' , verifyToken , get_Story );

// deleting
router.delete('/delete_user' , verifyToken , deleteUser );
router.delete('/delete_Story/:userID' , verifyToken , delete_Story );
router.delete('/delete_message' , verifyToken , deleteMassege);
router.delete('/deleteConvo/:id' , verifyToken , delete_convo);
router.delete('/deletePost/:id' , verifyToken , delete_post)
//post 
router.post('/post' , verifyToken ,uploadPost.array('photos', 12), post );
router.put('/addComment/:id' , verifyToken , Add_comments );
router.put('/like' , verifyToken , likes);
router.put('/edit/:id' , verifyToken , edit_post);
router.get('/get_Post/:id' , verifyToken ,get_post)
router.get('/get_comment/:id' , verifyToken ,get_comment)
router.get('/getFollowingsPost' , verifyToken , allPost);
router.put('/privacy' , verifyToken , change_user_privacy)
router.get('/explorePosts', verifyToken , exploreGetPost)
// follow 

router.put('/follow/:id'  , verifyToken , follow);
router.get('/getFollowingFollowers/:id'  , verifyToken , get_following_followers);

export {router  as authRouter};
