import {IAuthorsByID, ICommentsByParent} from "../../App"
import "./Comment.scss";
import { useState } from "react";
import classNames from "classnames";
import { numberWithSpaces, getWordFormByNumber } from "src/lib/utils";

export interface IComment {
    author: number,
    created: string,
    id: number;
    likes: number;
    parent: number | null;
    text: string;
}

interface ICommentProps {
    commentData: IComment,
    authorsByID: IAuthorsByID,
    commentsByParent: ICommentsByParent,
    setLikeScoreInComment: (id: number, likesScore: number) => void
}

export const Comment = ({
    commentData,
    authorsByID,
    commentsByParent,
    setLikeScoreInComment
}: ICommentProps) => {

    const [isLiked, updateIsLiked] = useState<boolean>(false);
    
    const commentDateTime = new Date(commentData.created);
    const author = authorsByID[commentData.author];
    const replies = commentsByParent[commentData.id] ? commentsByParent[commentData.id] : [];

    const handlerClickLike = () => {
        const updatedIsLiked = !isLiked;
        const updatedLikesScore = updatedIsLiked ? commentData.likes + 1 : commentData.likes - 1;

        setLikeScoreInComment(commentData.id, updatedLikesScore);
        updateIsLiked(updatedIsLiked);
    }

    const getFormatedDate = () => {
        const now = new Date();
        const hoursDiff = Math.floor(Math.abs(now.getTime() - commentDateTime.getTime()) / ( 1000 * 3600) );

        if (hoursDiff > 4){
            return commentDateTime.toLocaleString();
        } else {
            return (hoursDiff > 0) ? `${hoursDiff} ${getWordFormByNumber(hoursDiff, ["час", "часа", "часов"])} назад` : "Меньше часа назад";
        }
    }

    const classes: string = classNames(
        "likes",
        { liked: isLiked }
    );

    const formatedLikesScore = numberWithSpaces(commentData.likes);
    const dateLabel = getFormatedDate();

    return (
        <div className="comment flex-desktop">
            <div className="comment_wrap">   
                <div className="avatar">
                    <img src={author.avatar} alt="" />
                </div>
                <div className="body">
                    <div className="header">
                        <div className="author_date_likes">
                            <div className="author_date">
                                <span className="author">{author.name}</span>
                                <span className="date">{dateLabel}</span>
                            </div>

                            <span 
                                className={classes}    
                                onClick={handlerClickLike}
                            >{formatedLikesScore}</span>
                        </div>
                    </div>
                    <div className="comment_message">
                        <p>{commentData.text}</p>
                    </div>
                </div>
            </div>

            {replies.length > 0 && (
                <div className="replies">
                    {replies.map((comment) => (
                        <Comment
                            key={comment.id}
                            commentData={comment}
                            authorsByID={authorsByID}
                            commentsByParent={commentsByParent}
                            setLikeScoreInComment={setLikeScoreInComment}
                        />
                    ))}
                </div>
                )
            }
        </div>
    )
  }
