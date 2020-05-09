import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faIdBadge // I also like faReceipt
} from '@fortawesome/free-solid-svg-icons'

const PageTitle = ({pageName, score, crumbs}) => {
    let title = pageName ? `Immunify | ${pageName}` : "Immuto"
    score = score || 0
    if (!pageName) {
        pageName = "Dashboard"
    }
    window.document.title = title
    
    return (
        <span>
            <h2 className="h2 text-gray mt-3 page-title">
               {pageName}

               <span className="float-right">
                


                <h2 className="user-score">
                {score}
                <FontAwesomeIcon className="ml-1" icon={faIdBadge} size="sm"/>
                </h2>
                </span> 
            </h2>
            <hr/>
            {crumbs}
        </span>
    );
}

export default PageTitle;
