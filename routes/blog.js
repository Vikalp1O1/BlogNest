const {Router}= require('express');
const multer= require('multer');
const router = Router();
const path=require('path');
const Blog= require('../models/blog');


// local storage for storing Image that uploaded in new blog
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(`./public/uploads`));
    },
    filename: function (req, file, cb) {
      const filename=`${Date.now()}-${file.originalname}`;
      cb(null,filename);
    }
  })
  
  const upload = multer({ storage: storage })

router.get('/add',(req,res)=>{
    res.render("addBlog",{
        user:req.user,
    });
});

router.post('/comment/:blogId',(req,res)=>{
 
});

router.post('/',upload.single("coverImage"),async (req,res)=>{
    const {title,body}= req.body;
  const blog=await  Blog.create({
        body,
        title,
        createdBy: req.user._id,
        coverImageUrl: `/uploads/${req.file.filename}`,
     });
    res.redirect(`/blog/${blog._id}`);
});

router.get('/:id',async(req,res) =>{
  const blog= await Blog.findById(req.params.id).populate('createdBy');
  return res.render('blog',{
    user:req.user,
    blog,
  })
});


module.exports=router;