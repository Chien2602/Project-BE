const Review = require("../../models/reviewModel");
const Reply = require("../../models/replyModel");
const Account = require("../../models/accountModel");
const Product = require("../../models/productModel");

// [GET] Calculate total average rating
const totalRating = async (req, res) => {
    try {
        const ratings = await Review.find().select("rating");

        if (ratings.length === 0) {
            return res.status(200).json({
                success: true,
                average: 0,
                message: "No ratings found"
            });
        }

        const sumRating = ratings.reduce((sum, review) => sum + review.rating, 0);
        const meanRating = (sumRating / ratings.length).toFixed(1);

        return res.status(200).json({
            success: true,
            average: meanRating
        });
    } catch (err) {
        console.error("Error calculating average rating:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// [POST] Create a comment
const addReview = async (req, res) => {
    try {
        const {
            userId,
            productId,
            rating,
            comment
        } = req.body;

        if (!userId || !productId || rating === undefined) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin đánh giá!"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Đánh giá phải từ 1 đến 5 sao!"
            });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Sản phẩm không tồn tại!"
            });
        }
        const newReview = new Review({
            userId,
            productId,
            rating,
            comment
        });
        await newReview.save();
        const reviews = await Review.find({
            productId
        }).select("rating");
        const avgRating = (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);

        product.averageRating = avgRating;
        await product.save();

        res.status(201).json({
            success: true,
            message: "Đánh giá đã được thêm thành công!",
            data: newReview,
            averageRating: avgRating
        });
    } catch (error) {
        console.error("Lỗi khi thêm đánh giá:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ nội bộ!"
        });
    }
};

// [POST] Reply to a comment or review
const replyToComment = async (req, res) => {
    try {
        const {
            reviewId
        } = req.params;
        const {
            userId,
            comment,
            parentReplyId
        } = req.body;

        if (!userId || !comment) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields!"
            });
        }

        const newReply = new Reply({
            userId,
            comment,
            replies: []
        });
        await newReply.save();

        if (parentReplyId) {
            const parentReply = await Reply.findById(parentReplyId);
            if (!parentReply) {
                return res.status(404).json({
                    success: false,
                    message: "Parent reply not found"
                });
            }
            parentReply.replies.push(newReply._id);
            await parentReply.save();
        } else {
            const review = await Review.findById(reviewId);
            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: "Review not found"
                });
            }
            review.replies.push(newReply._id);
            await review.save();
        }

        res.status(201).json({
            success: true,
            message: "Reply added successfully!",
            reply: newReply
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// [DELETE] Xóa bình luận hoặc phản hồi
const deleteComment = async (req, res) => {
    try {
        const {
            id
        } = req.params.id;

        const comment = await Review.findById(id);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found!"
            });
        }
        if (!comment.parentId) {
            await Reply.deleteMany({
                parentReplyId: commentId
            });
        } else {
            await Reply.findByIdAndUpdate(comment.parentId, {
                $pull: {
                    replies: id
                }
            });
        }
        await Review.findByIdAndDelete(commentId);

        return res.status(200).json({
            success: true,
            message: "Comment deleted successfully!"
        });
    } catch (error) {
        console.error("Error deleting comment:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    totalRating,
    replyToComment,
    addReview,
    deleteComment,
};