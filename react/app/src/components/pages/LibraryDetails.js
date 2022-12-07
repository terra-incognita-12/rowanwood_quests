import { useParams } from "react-router"

import LibraryInfo from "../pageComponents/LibraryInfo"

const LibraryDetails = () => {

	const { url } = useParams()

	return (
		<LibraryInfo url={url}/>
	)
}

export default LibraryDetails