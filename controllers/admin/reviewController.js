const Review = require("../../models/reviewModel");
const Reply = require("../../models/replyModel");
const Account = require("../../models/accountModel");
const Product = require("../../models/productModel");

// [GET] Get all reviews
// /api/v1/admin/reviews
const getReviews = async (req, res) => {
    try {
        let reviews = await Review.find({ hide: false }).lean();

        const userIds = reviews.map(review => review.userId);
        const productIds = reviews.map(review => review.productId);

        const users = await Account.find({ _id: { $in: userIds } }).select("_id fullname email").lean();
        const products = await Product.find({ _id: { $in: productIds } }).select("_id title price").lean();

        const userMap = users.reduce((map, user) => ({ ...map, [user._id]: user }), {});
        const productMap = products.reduce((map, product) => ({ ...map, [product._id]: product }), {});

        reviews = reviews.map(review => ({
            ...review,
            userId: userMap[review.userId] || null,
            productId: productMap[review.productId] || null
        }));

        return res.status(200).json({
            message: "Get all reviews successfully!",
            data: reviews
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error getting all reviews!",
            error: error.message
        });
    }
};

// [GET] Get all reviews of a user
// /api/v1/admin/reviews/user/:id
const getAllReviewsUser = async (req, res) => {
    try { 
        const { id } = req.params;
        const reviews = await Review.find({ hide: false, userId: id });

        return res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// [GET] Calculate total average rating
const totalRating = async (req, res) => {
    try {
        const ratings = await Review.find().select("rating");

        if (ratings.length === 0) {
            return res.status(200).json({ success: true, average: 0, message: "No ratings found" });
        }

        const sumRating = ratings.reduce((sum, review) => sum + review.rating, 0);
        const meanRating = (sumRating / ratings.length).toFixed(1);

        return res.status(200).json({ success: true, average: meanRating });
    } catch (err) {
        console.error("Error calculating average rating:", err);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// [POST] Create a comment
const createComment = async (req, res) => {
    try {
        const { userId, postId, content, parentId } = req.body;

        if (!userId || !postId || !content) {
            return res.status(400).json({ success: false, message: "Missing required fields!" });
        }

        const newComment = new Comment({ userId, postId, content, parentId });
        await newComment.save();

        res.status(201).json({ success: true, message: "Comment added successfully!", data: newComment });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// [POST] Reply to a comment or review
const replyToComment = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { userId, comment, parentReplyId } = req.body;

        if (!userId || !comment) {
            return res.status(400).json({ success: false, message: "Missing required fields!" });
        }

        const newReply = new Reply({ userId, comment, replies: [] });
        await newReply.save();

        if (parentReplyId) {
            const parentReply = await Reply.findById(parentReplyId);
            if (!parentReply) {
                return res.status(404).json({ success: false, message: "Parent reply not found" });
            }
            parentReply.replies.push(newReply._id);
            await parentReply.save();
        } else {
            const review = await Review.findById(reviewId);
            if (!review) {
                return res.status(404).json({ success: false, message: "Review not found" });
            }
            review.replies.push(newReply._id);
            await review.save();
        }

        res.status(201).json({ success: true, message: "Reply added successfully!", reply: newReply });
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// [DELETE] Xóa bình luận hoặc phản hồi
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params.id;

        const comment = await Review.findById(id);
        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found!" });
        }
        if (!comment.parentId) {
            await Reply.deleteMany({ parentReplyId: commentId });
        } else {
            await Reply.findByIdAndUpdate(comment.parentId, {
                $pull: { replies: id }
            });
        }
        await Review.findByIdAndDelete(commentId);

        return res.status(200).json({ success: true, message: "Comment deleted successfully!" });
    } catch (error) {
        console.error("Error deleting comment:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


const hideComment = async (req, res) => {
    try {
        const { id } = req.params.id;
        const { hide } = req.body; // true: ẩn, false: hiện

        const comment = await Review.findByIdAndUpdate(
            id,
            { hide },
            { new: true }
        );

        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found!" });
        }

        return res.status(200).json({
            success: true,
            message: hide ? "Comment hidden successfully!" : "Comment is now visible!",
            data: comment
        });
    } catch (error) {
        console.error("Error hiding comment:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


module.exports = {
    getReviews,
    getAllReviewsUser,
    totalRating,
    replyToComment,
    createComment,
    deleteComment,
    hideComment
};
