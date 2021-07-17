import { TOKEN } from './token.json';
import { ChannelResolvable, Client, Message } from 'discord.js';
import ytdl = require('ytdl-core');

const client = new Client();
const prefix = "checksongs"

async function checklinks(channelid: ChannelResolvable, returnchannel: Message) {

	const handleSuccessMessage = (url: string) => () => {
		return { status: "success", message: `This one works!: <${url}>`, }
  	}
  	const handleFailureMessage = (url: string) => () => {
		return { status: "failure", message: `This one does not work!: <${url}>`, }
	}

  	const getUrlInfo = async (messages: string[]) => {
		const flattenedMessages = messages.reduce((acc: string[], message: string) => {
	  		acc.push(...message.split("\n"))
	  		return acc
	}, [])
  
	const urls = flattenedMessages
	  .filter(m => m.startsWith("-p"))
	  .map(m => m.replace(/-p /g, ""))
  
	const responses = await Promise.all(
	  urls.map(
		url => ytdl
		  .getInfo(url)
		  .then(handleSuccessMessage(url))
		  .catch(handleFailureMessage(url))
	  )
	)
  
	const successfulResponses = responses.filter(r => r.status === "success")
	const failedResponses = responses.filter(r => r.status === "failure")

	for (const response of successfulResponses) {
		await returnchannel.channel.send(response.message)
	}
	for (const response of failedResponses) {
		await returnchannel.channel.send(response.message)
	}
  }

	const channel = client.channels.resolve(channelid);
	if (!channel.isText()) return;
	const messages = (await channel.messages.fetch()).map(m => m.content);

  	await getUrlInfo(messages)
	await returnchannel.channel.send('All done!')
};

client.once('ready', () => {
	console.info(`${client.user.tag} is back, you mortals.`);
	client.user.setPresence({activity:{type: 'WATCHING', name: `for your playlists`}, status:'online'});
});

client.on('message', async (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot || !message.member) return;

	const args = message.content.slice(prefix.length).trim().split(' ').shift().toString();
	if (args.length == 0) return message.channel.send('You did not specify a channel id! (Right click on the channel, and copy id)')
	if (!message.guild.channels.resolve(args)) return message.channel.send('This channel is invalid, or I am not a member of it!')
	
	checklinks(args, message)
});

client.login(`${TOKEN}`)