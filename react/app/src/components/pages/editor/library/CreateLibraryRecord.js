import { Link } from "react-router-dom"
import Button from '@mui/material/Button';

import CreateLibraryRecordForm from "../../../forms/CreateLibraryRecordForm"

const CreateLibraryRecord = () => {
	return (
		<div className="mt-3">	
			<Button component={Link} to="/editor" variant="text" size="large">&lt;&lt; Back</Button>
			<CreateLibraryRecordForm />
		</div>
	)
}

export default CreateLibraryRecord