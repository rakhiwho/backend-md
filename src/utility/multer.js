import multer from "multer";




export  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './src/media/'); // Directory where files will be stored
    },
    filename: function (req, file, cb) {
      cb(null,  `${Date.now()}+${file.originalname}`); // Naming the file
    }
  });
  
  // Initialize multer with the storage configuration
 export const upload = multer({ 
    storage: storage ,

    fileFilter : function (req , file , cb){
        if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png' ){
       cb(null , true)
        }  else{
          console.log(file)
            cb(new Error (" Only .jpeg and .png are allowed") , false)
        }
    }
    
   });

   export const uploadPost = multer({ 
    storage: storage ,

   
    
   });