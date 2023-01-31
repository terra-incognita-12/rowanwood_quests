import { useState, useEffect, forwardRef } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"
import { useParams } from "react-router"

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import Box from '@mui/material/Box';
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
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import Stack from '@mui/material/Stack';

import EditQuestLineForm from "../../../forms/EditQuestLineForm"
import axios from "../../../../api/axios"
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

    const navigate = useNavigate()
    const location = useLocation()
    const axiosPrivate = useAxiosPrivate()  
    const redirectLogin = useRedirectLogin(location)

    const handleLineModalOpen = () => {
        setLineModalOpen(true)
    }

    const handleLineModalClose = () => {
        setLineModalOpen(false)
    }

    const handleLineDelete = async (id) => {
        const answer = window.confirm("Are you sure to delete this line?")
        if (!answer) { return }

        try {
            await axiosPrivate.delete(`/quest/lines/delete/${id}`, JSON.stringify({id}))
            navigate(`/editor/quest/edit/${url}`, { replace: true})
        } catch (err) {
            console.log(err)
        }
    }

	useEffect(() => {
        let isMounted = true
        const controller = new AbortController()

        const getQuestLine = async () => {
            
            try {
                const response = await axios.get(`/quest/lines/${url}/${unique_number}`, {
                    signal: controller.signal
                })
                isMounted && setQuestLine(response.data)
            } catch (err) {
                if (err?.response?.status === 404) {
                    navigate(`/notexist?err=${err?.response?.data?.detail}`)
                } else {
                    console.log(err)
                }
                return
            } 
        }

        const getLines = async () => {
            try {
                const response = await axios.get(`/quest/lines/all/${url}`, {
                    signal: controller.signal
                })

                let dataQuestLines = [] 
                for (const line of response.data) {
                    dataQuestLines.push({"id": line.id, "name": line.name})
                }
                isMounted && setQuestsLinesList(dataQuestLines) 
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
    }, [url, unique_number])

    return (
        <div className="mt-3">
            <Button component={Link} to={`/editor/quest/edit/${url}`} variant="text" size="large">&lt;&lt; Back to quest lines</Button>
            <Card className="mt-3">
                <CardContent>

                    <Stack spacing={2} direction="row" sx={{ display: 'flex', justifyContent: 'space-between' }} className="mb-3">
                        <Box>
                            <Typography gutterBottom variant="h4">{questLine.name}</Typography>
                            <Stack spacing={1} direction="row">
                                <Button variant="contained" color="primary" onClick={handleLineModalOpen}>Edit Quest Line</Button>
                                <Button variant="contained" color="error" onClick={() => handleLineDelete(questLine.id)}>Delete Quest Line</Button>
                            </Stack>
                        </Box>
                        {questLine.photo
                            ? (
                                <Box
                                    component="img"
                                    sx={{
                                        height: 150,
                                        width: 150,
                                        borderRadius: '8px',
                                    }}
                                    alt="Photo"
                                    src={questLine.photo}
                                />
                            )
                            : null
                        }
                    </Stack>
                    <Typography gutterBottom variant="body1">{questLine.description}</Typography>
                    <hr/>
                    <Typography gutterBottom variant="h6">Options:</Typography>
                    {questLine.quest_current_options?.length
                        ?
                        questLine.quest_current_options.map((option, i) => 
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
                            <CloseIcon />
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