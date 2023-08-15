import { useEffect, useState, useMemo } from "react";
import {Comment,  IComment} from "./components/Comment/Comment";
import CommentsHeader from "./components/CommentsHeader/CommentsHeader";
import "./App.css";
import getAuthorsRequest from "./api/authors/getAuthorsRequest";
import getCommentsRequest from "./api/comments/getCommentsRequest";

interface IAuthor {
    id: number,
    name: string,
    avatar: string    
}

export interface IAuthorsByID {
    [id: number] : IAuthor  
}

export interface ICommentsByParent {
    [id: number]: IComment[]
}

interface IPagination {
    page: number;
    size: number;
    total_pages: number;
}

let commentsByParent: ICommentsByParent = {};

const App = () => {
    const [isLoading, updateIsLoading] = useState<boolean>(true);
    const [comments, updateComments] = useState<IComment[]>([]);
    const [pagination, updatePagination] = useState<IPagination>({page: 0, size: 0, total_pages: 0});
    const [authorsByID, updateAuthorsByID] = useState<IAuthorsByID>({});

    useEffect(() => {
        getAuthors();
        getCommentsPage(1);        
      }, []);

    const getAllLikesScore = () => {
        return comments.reduce( (acc, comment) => acc + comment.likes, 0);
    }
    
    const allLikesCount = useMemo(() => getAllLikesScore(), [comments]);
    
    const prepareCommentsPageData = ( commentsOnPage: IComment[] ) => {
        commentsOnPage = commentsOnPage.map( (comment: IComment) => {
            let parent_id = comment.parent ? comment.parent : 0;
            
            /* TODO: не очень прикольная проверка но что пришлось добавить для dev сервера, т.к. там useEffect срабатывает 2 раза и набираются дубли(
                в билде уже таких проблем нету. красивого решения пока не придумал а пихать commentsByParent в state тоже неоч хотелось, поэтому увы пока с таким допущением
            */

            if (commentsByParent[parent_id] && !commentsByParent[parent_id].some(replie => replie.id === comment.id)){
                commentsByParent[parent_id].push(comment);
            } else {
                commentsByParent[parent_id] = [comment];
            }
            
            return comment;
        });

        commentsOnPage = commentsOnPage.sort( (a, b) => b.created > a.created ? 1 : -1);
        return commentsOnPage;
    }

    const getAuthors = () => {
        getAuthorsRequest()
            .then( (data: IAuthor[]) => {
                let authorsObject: IAuthorsByID = {};
                data.forEach( author => authorsObject[author.id] = author);
                updateAuthorsByID(authorsObject);
            }, (e) => {
                alert("Что-то пошло не так, попробуйте повторить попытку позже");
                console.log(e)
            });
    } 
    
    const getCommentsPage = (page: number) => {
        getCommentsRequest(page)
            .then( (data) => {
                const commentsOnPage = prepareCommentsPageData(data.data);
                updatePagination(data.pagination);
                updateComments([...comments, ...commentsOnPage]);
            })
            .catch((e) => {
                alert("Что-то пошло не так, попробуйте повторить попытку позже");
                console.log(e)
            })
            .finally(() => {
                updateIsLoading(false);
            });
    } 

    const setLikeScoreInComment = (commentId: number, likesScore: number) => {
        const updatedComments = [...comments];
        
        updatedComments.forEach( comment => {
            if (comment.id === commentId) {
                comment.likes = likesScore;
            }
        })

        updateComments(updatedComments);
    }

    const topLevelComments = commentsByParent[0] ? commentsByParent[0] : [];

    if (isLoading) {
        return (<span className="loading_label">Загрузка</span>);
    }

    return (
        <main className="App">
            <CommentsHeader allCommentsCount={comments.length} allLikesCount={allLikesCount}  />
            <div className="comments_list">
                {topLevelComments.length > 0 && (
                    <>
                        {topLevelComments.map((comment: IComment) => (
                            <Comment
                                key={comment.id}
                                commentData={comment}
                                authorsByID={authorsByID}
                                commentsByParent={commentsByParent}
                                setLikeScoreInComment={setLikeScoreInComment}
                            />
                        ))}
                    </>
                )}
                {topLevelComments.length === 0 && (
                    <div className="empty_comments_list">Для данной записи комментариев нет</div>
                )}
            </div>
            {pagination.page < pagination.total_pages && (
                <button onClick={() => getCommentsPage(pagination.page + 1)}>Загрузить ещё</button>
            )}
        </main>
    );
}

export default App;
