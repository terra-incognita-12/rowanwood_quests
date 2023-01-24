import { useSearchParams } from "react-router-dom";
import Typography from '@mui/material/Typography';

const NotExist = () => {
	let [searchParams, setSearchParams] = useSearchParams();
	let err = searchParams.get("err")

	return (
		<>
			<Typography gutterBottom variant="h1" display="flex" justifyContent="center" alignItems="center">404</Typography>
			<Typography gutterBottom variant="h3" display="flex" justifyContent="center" alignItems="center">{err}</Typography>
		</>
	)
}

export default NotExist