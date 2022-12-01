import Alert from "react-bootstrap/Alert"

const ErrMsg = ({ msg, handleShowErr }) => {
	return (
		<Alert variant="danger" className="mt-2" onClose={() => handleShowErr(false)} dismissible>
			<p>{msg}</p>
		</Alert>
	)
}

export default ErrMsg