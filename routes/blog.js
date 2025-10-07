const { Router } = require("express");
const multer = require('multer');
const path = require("path");

const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(`./public/uploads/`));
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    },
});

const upload = multer({ storage: storage });

router.get('/add-new', (req, res) => {
    return res.render("addBlog", {
        user: req.user,
    });
});

// ✅ Corrected route
router.get("/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate("createdBy");
        const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy");

        if (!blog) {
            return res.status(404).render('404', { message: 'Blog not found' });
        }
        console.log("Comment: ", comments);
        return res.render('blog', {
            user: req.user,
            blog,
            comments,
            error: req.query.error, // ✅ add this line
        });
    } catch (err) {
        console.error(err);
        return res.status(500).render('error', { message: 'Internal Server Error' });
    }
});

// router.post('/comment/:blogId', async (req, res) => {
//     await Comment.create({
//         content: req.body.content,
//         blogId: req.params.blogId,
//         createdBy: req.user._id,
//     });
//     return res.redirect(`/blog/${req.params.blogId}`); // ✅ Fixed backticks
// });
router.post('/comment/:blogId', async (req, res) => {
    try {
        const { content } = req.body;
        const { blogId } = req.params;

        // 🧠 Step 1: Validate input
        if (!content || content.trim().length === 0) {
            return res.redirect(`/blog/${req.params.blogId}`);
        }


        // 🧠 Step 2: Create comment safely
        await Comment.create({
            content: content.trim(),
            blogId,
            createdBy: req.user._id,
        });

        // 🧠 Step 3: Redirect back to blog page
        return res.redirect(`/blog/${blogId}`);
    } catch (err) {
        console.error(err);
        return res.status(500).render('error', { message: 'Failed to post comment' });
    }
});


router.post('/', upload.single('coverImage'), async (req, res) => {
    const { title, body } = req.body;
    const blog = await Blog.create({
        body,
        title,
        createdBy: req.user._id,
        coverImageURL: `/uploads/${req.file.filename}`,
    });
    return res.redirect(`/blog/${blog._id}`);
});

module.exports = router;
