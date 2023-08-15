import "./CommentsHeader.scss";
import { numberWithSpaces, getWordFormByNumber } from "src/lib/utils";

interface HeaderProps {
    allCommentsCount: number,
    allLikesCount: number,
}

const CommentsHeader = ({
    allCommentsCount,
    allLikesCount
}: HeaderProps) => {
    const formatedAllLikesCount = numberWithSpaces(allLikesCount);
    const commentsCountLabel = `${allCommentsCount} ${getWordFormByNumber(allCommentsCount, ['комментарий', 'комментария', 'комментариев'])}`;
    return (
        <div className="comments_header">
            <span>{commentsCountLabel}</span>
            <span className="likes">{formatedAllLikesCount}</span>
        </div>
    );
} 


export default CommentsHeader;