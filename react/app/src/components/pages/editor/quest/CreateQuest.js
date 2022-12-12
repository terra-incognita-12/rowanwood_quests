import { Link } from "react-router-dom"
import Button from '@mui/material/Button';

import CreateQuestForm from "../../../forms/CreateQuestForm"

const CreateQuest = () => {
	return (
		<div className="mt-3">	
			<Button component={Link} to="/editor" variant="text" size="large">&lt;&lt; Back</Button>
			<CreateQuestForm />
		</div>
	)
}

export default CreateQuest