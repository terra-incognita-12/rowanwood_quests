import logging
import requests
from time import sleep
from decouple import config

from telegram import (
	InlineKeyboardButton, 
	InlineKeyboardMarkup, 
	Update,
	BotCommand,
)
from telegram.ext import (
	Application,
	CallbackQueryHandler,
	CommandHandler,
	ContextTypes,
	ConversationHandler,
)

from telegram.error import BadRequest

from telegram.constants import ChatAction

BACKEND_URL = config('BACKEND_URL')
QUEST_URL = config('QUEST_URL')
TOKEN=config('TOKEN')

SLEEP_BEFORE_MESSAGE = 0.5
NEXT_STEP = 1

logging.basicConfig(
	format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
	level=logging.INFO
)
logger = logging.getLogger(__name__)

class GetQuestInfoException(Exception):
	def __init__(self, message):
		self.message = message

def get_quest_info(unique_number: int = None):
	try:
		if unique_number:
			response = response = requests.get(f'{BACKEND_URL}/quest/lines/{QUEST_URL}/{unique_number}')
		else:
			response = requests.get(f'{BACKEND_URL}/quest/{QUEST_URL}')
		
		if response.status_code == 200:
			return response.json()
		else:
			print(f'{response.status_code}: {response.content}')
			
	except requests.exceptions.RequestException as e:
		print(f'Request error: {e}')
	except Exception as e:
		print(f'Error: {e}')
	
	raise GetQuestInfoException('⚠️ ERROR ⚠️ : Sorry, it was an error while pulling quest, we are already working on that issue, please come back later!')

# Sending text with action and sleep
async def current_chat_action(context, id, action):
	await context.bot.sendChatAction(id, action)
	sleep(SLEEP_BEFORE_MESSAGE)

# BOT FUNCTIONS
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
	user = update.message.from_user
	
	logger.info(f'User {user.first_name} started the conversation.')
	
	try:
		quest_info = get_quest_info()
	except GetQuestInfoException as e:
		await update.message.reply_text(e.message)
		return ConversationHandler.END

	await update.message.reply_text(f"Hello {user.first_name}! Welcome to the quest \"{quest_info['name']}\" by Rowan Wood! Enjoy and don't forget to write your review on it on the website!")

	if quest_info['photo']:
		try:
			await current_chat_action(context, update.effective_chat.id, ChatAction.UPLOAD_PHOTO)
			await context.bot.sendPhoto(update.effective_chat.id, quest_info['photo'])
		except BadRequest: print('DEV MODE OR BAD REQUEST')

	await current_chat_action(context, update.effective_chat.id, ChatAction.TYPING)
	await update.message.reply_text(f"QUEST INFO \n\n {quest_info['full_description']} \n\n")

	try:
		first_line = get_quest_info(1)
	except GetQuestInfoException as e:
		await update.message.reply_text(e.message)
		return ConversationHandler.END

	keyboard = []
	for elem in first_line['quest_current_options']:
		keyboard.append([InlineKeyboardButton(elem['name'], callback_data=elem['quest_next_line']['unique_number'])])

	reply_markup = InlineKeyboardMarkup(keyboard)

	if first_line['photo']:
		try:
			await current_chat_action(context, update.effective_chat.id, ChatAction.UPLOAD_PHOTO)
			await context.bot.sendPhoto(update.effective_chat.id, first_line['photo'])
		except BadRequest: print('DEV MODE OR BAD REQUEST')

	await current_chat_action(context, update.effective_chat.id, ChatAction.TYPING)
	await update.message.reply_text(first_line['description'], reply_markup=reply_markup)

	return NEXT_STEP

async def next_step(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
	query = update.callback_query
	await query.answer()

	try:
		current_line = get_quest_info(int(query.data))
	except GetQuestInfoException as e:
		await update.message.reply_text(e.message)
		return ConversationHandler.END

	keyboard = []
	for elem in current_line['quest_current_options']:
		keyboard.append([InlineKeyboardButton(elem['name'], callback_data=elem['quest_next_line']['unique_number'])])

	reply_markup = InlineKeyboardMarkup(keyboard)

	if current_line['photo']:
		try:
			await current_chat_action(context, update.effective_chat.id, ChatAction.UPLOAD_PHOTO)
			await context.bot.sendPhoto(update.effective_chat.id, current_line['photo'])
		except BadRequest: print('DEV MODE OR BAD REQUEST')
	
	await current_chat_action(context, update.effective_chat.id, ChatAction.TYPING)
	await query.message.reply_text(current_line['description'], reply_markup=reply_markup)
	if not keyboard:
		await query.message.reply_text('To restart quest again push /start', reply_markup=reply_markup)
		return ConversationHandler.END

	return NEXT_STEP

def main():
	application = Application.builder().token(TOKEN).build()

	commands = [
		BotCommand(command='/start', description='Start and restart quest')
	]

	quest_handler = ConversationHandler(
		entry_points=[CommandHandler("start", start)],
		states={
			NEXT_STEP: [
				CallbackQueryHandler(next_step),
			],
		},
		fallbacks=[CommandHandler("start", start)],
	)

	application.add_handler(quest_handler)
	application.updater.bot.set_my_commands(commands)

	application.run_polling()

if __name__ == '__main__':
	main()