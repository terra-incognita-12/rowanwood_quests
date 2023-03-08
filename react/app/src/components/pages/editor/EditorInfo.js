import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Link } from "react-router-dom"
import Button from '@mui/material/Button';

const EditorInfo = () => {

	return (
        <div className="mt-3">
            <Button component={Link} to="/editor" variant="text" size="large">&lt;&lt; Back</Button>
            <Card className="mt-3">
                <CardContent>
                    <Typography gutterBottom variant="h6" color="text.secondary">INSTRUCTIONS</Typography>
                    <Typography gutterBottom variant="h6" sx={{ "font-style": "oblique" }}>1) To create a new quest use "CREATE QUEST" option. Quest will be not immeadiately available on the web-site, you have to request activation by the button "REQUEST ACTIVATION" in "EDIT QUEST" mode. Providing photo for quest is optional</Typography>
                    <Typography gutterBottom variant="h6" sx={{ "font-style": "oblique" }}>2) To create quest lines use "EDIT LINES" option in "EDIT QUEST" mode. To create initial line use "CREATE NEW LINE" option, set up "Unique Number" option as "1" and delete all options. Create the other lines one by one, increasing the unique number. To connect lines to each other use 
                    "Options" option, if lines should be the last - delete all the options. Providing photo for quest line is optional</Typography>
                    <Typography gutterBottom variant="h6" sx={{ "font-style": "oblique" }}>3) Only admin can delete quest.</Typography>
                    <Typography gutterBottom variant="h6" sx={{ "font-style": "oblique" }}>4) Use "CREATE LIBRARY RECORD" option to create new library record. While creating library record you can also add tags for it.</Typography>
                </CardContent>
            </Card>
        </div>
	)
}

export default EditorInfo