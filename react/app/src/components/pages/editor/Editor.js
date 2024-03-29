import { Link } from "react-router-dom"
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

const Editor = () => {
	return (
		<Stack spacing={2} className="mt-3">
			<Button component={Link} to="/editor/quest/create">Create Quest</Button>
			<Button component={Link} to="/editor/quest/edit">Edit Quest</Button>
			<Button component={Link} to="/editor/library/create">Create Library Record</Button>
			<Button component={Link} to="/editor/library/edit">Edit Library Record</Button>
			<Button component={Link} to="/editor/library/tags">Edit Library Tags</Button>
			<Button component={Link} to="/editor/info">Information</Button>
		</Stack>
	)
}

export default Editor