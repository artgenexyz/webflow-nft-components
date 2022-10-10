import { getProjectInfo } from "../project";
import { useEffect, useState } from "react";

export const useProject = () => {
    const [project, setProject] = useState()
    const id = window.PROJECT_ID

    useEffect(() => {
        if (id) {
            getProjectInfo(id).then(setProject)
        }
    }, [id])

    return project
}