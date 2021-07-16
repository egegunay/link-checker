import { TOKEN } from './token.json';
import { ChannelResolvable, Client, Message } from 'discord.js';
import ytdl = require('ytdl-core');

const client = new Client();
const prefix = "checksongs"

async function checklinks(channelid: ChannelResolvable, returnchannel: Message) {

	const channel = client.channels.resolve(channelid);
	if (!channel.isText()) return;
	const messages = channel.messages.fetch();

	await Promise.all((await messages).map(async (msg) => {
		if (msg.content.startsWith('-p')) {
			const url = msg.content.replace(/ /g, "").slice('-p'.length);
			await ytdl.getInfo(url).catch(async () => {
				await returnchannel.channel.send(`This link does not work! ${url}`);
			});
		}
	}))
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