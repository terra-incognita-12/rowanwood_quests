import { Link } from "react-router-dom"

import CreateLibraryRecordForm from "../../../forms/CreateLibraryRecordForm"

const CreateLibraryRecord = () => {
	return (
		<>
			<Link to="/editor" className="btn btn-primary mt-3">Back to Editor Menu</Link>
			<CreateLibraryRecordForm />
		</>
	)
}

export default CreateLibraryRecord