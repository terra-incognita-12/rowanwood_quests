import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

const ErrMsg = ({ msg, handleShowErr }) => {
	return (
		<Alert severity="error" onClose={() => handleShowErr(false)}>
			<AlertTitle>Error</AlertTitle>
			{msg}
		</Alert>
	)
}

export default ErrMsg