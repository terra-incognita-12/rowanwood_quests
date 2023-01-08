import { useState, useEffect, forwardRef } from "react"
import { useLocation, Link } from "react-router-dom"
import { useParams } from "react-router"

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import Stack from '@mui/material/Stack';

import EditQuestLineForm from "../../../forms/EditQuestLineForm"
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate"
import useRedirectLogin from "../../../../hooks/useRedirectLogin"

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const QuestLine = () => {
	const { url } = useParams()
	const { unique_number } = useParams()

    const [lineModalOpen, setLineModalOpen] = useState(false)
    const [questsLinesList, setQuestsLinesList] = useState([])
	const [questLine, setQuestLine] = useState("")

	const axiosPrivate = useAxiosPrivate()  
    const location = useLocation()
    const redirectLogin = useRedirectLogin(location)

    const handleLineModalOpen = () => {
        setLineModalOpen(true)
    }

    const handleLineModalClose = () => {
        setLineModalOpen(false)
    }

	useEffect(() => {
        let isMounted = true
        const controller = new AbortController()

        const getQuestLine = async () => {
            
            try {
                const response = await axiosPrivate.get(`/quest/lines/${url}/${unique_number}`, {
                    signal: controller.signal
                })
                isMounted && setQuestLine(response.data)
            } catch (err) {
                console.log(err)
            } 
        }

        const getLines = async () => {
            try {
                const response = await axiosPrivate.get(`/quest/lines/all/${url}`, {
                    signal: controller.signal
                })

                let dataQuestLines = [] 
                for (let i = 0; i < response.data.length; i++) {
                    let dataDict = {"id": response.data[i].id, "name": response.data[i].name}
                    dataQuestLines.push(dataDict)
                }
                if (isMounted) {
                    setQuestsLinesList(dataQuestLines)
                }
            } catch (err) {
                console.log(err)
            } 
        }

        getQuestLine()
        getLines()

        return () => {
            isMounted = false
            controller.abort()
        }
    }, [url ,unique_number])

    return (
        <div className="mt-3">
            <Button component={Link} to={`/editor/quest/edit/${url}`} variant="text" size="large">&lt;&lt; Back to quest lines</Button>
            <Card className="mt-3">
                <CardContent>
                    <Typography gutterBottom variant="h4" display="flex" justifyContent="center" alignItems="center">{questLine.name}</Typography>
                    <Stack spacing={2} direction="row" className="mb-4">
                        <Button variant="contained" color="primary" onClick={handleLineModalOpen}>Edit Quest Line</Button>
                        <Button variant="contained" color="error" >Delete Quest Line</Button>
                    </Stack>
                    <Typography gutterBottom variant="body1">{questLine.description}</Typography>
                    <hr/>
                    <Typography gutterBottom variant="h6">Options:</Typography>
                    {questLine.quest_options?.length
                        ?
                        questLine.quest_options.map((option, i) => 
                            <Stack direction="row" spacing={2} key={i}>
                                <Button component={Link} to={`/editor/quest/edit/${url}/${option.quest_next_line.unique_number}`} variant="text">{i+1}) {option.name} (Goto #{option.quest_next_line.unique_number} "{option.quest_next_line.name}")</Button>
                            </Stack>            
                        )
                        : <Typography gutterBottom variant="body1">Dead end...</Typography>
                    }
                </CardContent>
            </Card>

            <Dialog
                fullScreen
                open={lineModalOpen}
                onClose={handleLineModalClose}
                TransitionComponent={Transition}
            >
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleLineModalClose}
                            aria-label="close"
                        >
                            X
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            Edit Quest Line 
                        </Typography>
                    </Toolbar>
                </AppBar>
                <EditQuestLineForm handleLineModalClose={handleLineModalClose} questLine={questLine} questLinesList={questsLinesList} url={url}/>
            </Dialog>
        </div>
	)
}

export default QuestLine