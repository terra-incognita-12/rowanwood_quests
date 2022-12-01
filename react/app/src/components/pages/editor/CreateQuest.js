import { Link } from "react-router-dom"

import CreateQuestForm from "../../forms/CreateQuestForm"

const CreateQuest = () => {
	return (
		<>
			<Link to="/editor" className="btn btn-primary mt-3">Back to Editor Menu</Link>
			<CreateQuestForm />
		</>
	)
}

export default CreateQuest