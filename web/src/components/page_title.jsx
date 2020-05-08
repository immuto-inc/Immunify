import React from "react";

const PageTitle = ({pageName, actionButton, crumbs}) => {
    let title = pageName ? `Immuto | ${pageName}` : "Immuto"
    if (!pageName) {
        pageName = "Dashboard"
    }
    window.document.title = title
    
    return (
        <span>
            <h2 className="h2 text-gray mt-3">
               {pageName}
               {actionButton ? <span className="float-right">{actionButton}</span> : ""}
            </h2>
            <hr/>
            {crumbs}
        </span>
    );
}

export default PageTitle;
