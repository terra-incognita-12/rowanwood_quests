import { useParams } from "react-router"

import QuestInfo from "../pageComponents/QuestInfo"

const QuestDetails = () => {

	const { url } = useParams()

	return (
		<QuestInfo url={url}/>
	)
}

export default QuestDetails