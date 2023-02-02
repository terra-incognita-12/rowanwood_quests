import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

const LoadingBackdrop = ({ open }) => {
	return (
		<Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2 }} open={open}
		>
			<CircularProgress color="inherit" />
		</Backdrop>
	)
}

// zIndex: (theme) => theme.zIndex.drawer + 1

export default LoadingBackdrop