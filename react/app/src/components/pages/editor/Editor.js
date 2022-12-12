import { Link } from "react-router-dom"
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Stack from '@mui/material/Stack';

const Editor = () => {
	return (
		<Card className="mt-3">
            <CardContent>	
				<Typography variant="h4" gutterBottom>What do we doing today?</Typography>
			</CardContent>
			<CardActions>
				<Stack spacing={2} direction="row">
					<Button component={Link} to="/editor/quest/create">Create Quest</Button>
					<Button component={Link} to="/editor/quest/edit">Edit Quest</Button>
					<Button component={Link} to="/editor/library/create">Create Library Record</Button>
					<Button component={Link} to="/editor/library/edit">Edit Library Record</Button>
				</Stack>
  			</CardActions>
		</Card>
	)
}

export default Editor