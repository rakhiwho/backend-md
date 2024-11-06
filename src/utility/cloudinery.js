import { v2 as cloudinary } from 'cloudinary';
import express from 'express';
import fs from 'fs'
import { config } from 'dotenv';
  config();
    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINERY_NAME , 
        api_key:  process.env.CLOUDINERY_API_KEY, 
        api_secret:  process.env.CLOUDINERY_API_SECRET
    });
    
    //tracker 
    const upload_on_cloudinery = async  (localFilePath)=>{
      try {
        if(!localFilePath)null;
        //uplload the file on cloudinery

       const res = await cloudinary.uploader.upload(localFilePath ,{
            resource_type:'auto'
        })
        //file has been uploaded
        console.log(res.url)
       
        return res;

      } catch (error) {
         fs.unlinkSync(localFilePath); // removing file which has been 
         //recieved from client but operation failed
         console.log(error)
         return null;


      }
    }
   
    
export {upload_on_cloudinery} 