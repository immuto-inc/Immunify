import React from "react";

const PageTitle = ({pageName, score, crumbs}) => {
    let title = pageName ? `Immunify | ${pageName}` : "Immuto"
    if (!pageName) {
        pageName = "Dashboard"
    }
    window.document.title = title
    
    return (
        <span>
            <h2 className="h2 text-gray mt-3">
               {pageName}
               {score ? <span className="float-right">
                        <h5 className="user-score">{score}</h5>
                        </span> 
                      : ""}
            </h2>
            <hr/>
            {crumbs}
        </span>
    );
}

export default PageTitle;
