const axios = require('axios');
 
// Get wallet address from command line argument
const wallet = process.argv[2];
 
if (!wallet) {
  console.log('Please provide a wallet address:');
  console.log('Usage: node bot.js <wallet-address>');
  process.exit(1);
}
 
const config = {
  method: 'GET',
  url: `https://beta.orchestrator.nexus.xyz/users/${wallet}`,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'sec-ch-ua-platform': '"Windows"',
    'sec-ch-ua': '"Not(A:Brand";v="99", "Brave";v="133", "Chromium";v="133"',
    'Content-Type': 'application/json',
    'sec-ch-ua-mobile': '?0',
    'Sec-GPC': '1',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://app.nexus.xyz',
    'Sec-Fetch-Site': 'same-site',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'Referer': 'https://app.nexus.xyz/'
  }
};
 
function displayNodeInfo(data) {
  // Clear console before each update
  console.clear();
 
  // Show current time
  const now = new Date().toLocaleString();
  console.log(`\nLast Updated: ${now}`);
 
  // Header
  console.log('═'.repeat(50));
  console.log('           NEXUS NODE INFORMATION');
  console.log('═'.repeat(50));
  console.log(`🔗 Wallet: \n${data.walletAddress}`);
 
  let totalPoints = 0;
  let webNodes = 0;
  let cliNodes = 0;
 
  data.nodes.forEach(node => {
    totalPoints += node.testnet_two_points;
    if (node.nodeType === 1) webNodes++;
    if (node.nodeType === 2) cliNodes++;
  });
 
  // Summary Section
  console.log('\n📊 Summary:');
  console.log('─'.repeat(50));
  console.log(`Total Nodes: ${data.nodes.length}`);
  console.log(`WEB Nodes : ${webNodes}`);
  console.log(`CLI Nodes : ${cliNodes}`);
  console.log(`Total Points: ${totalPoints.toLocaleString()}`);
 
  // Active Nodes Section
  console.log('\n🔵 Active Nodes (with points):');
  console.log('─'.repeat(50));
  console.log('NodeID'.padEnd(10) + 'Type'.padEnd(10) + 'Points'.padEnd(10) + 'Last Updated');
  console.log('─'.repeat(50));
 
  data.nodes
    .filter(node => node.testnet_two_points > 0)
    .sort((a, b) => b.testnet_two_points - a.testnet_two_points)
    .forEach(node => {
      const nodeType = node.nodeType === 1 ? 'WEB' : 'CLI';
      console.log(
        `${node.id}`.padEnd(10) +
        `${nodeType}`.padEnd(10) +
        `${node.testnet_two_points.toLocaleString()}`.padEnd(10) +
        new Date(node.lastUpdated).toLocaleString()
      );
    });
  console.log('═'.repeat(50));
}
 
async function checkNodes() {
  try {
    const response = await axios.request(config);
    if (response.data && response.data.data) {
      displayNodeInfo(response.data.data);
    }
  } catch (error) {
    console.clear();
    console.error('Error fetching node data:', error.message);
    console.log('\nRetrying in 60 seconds...');
  }
}
 
// Initial message
console.log('\nStarting Nexus Node Monitor...');
console.log('Press Ctrl+C to exit\n');
 
// Run initial check
checkNodes();
 
// Check every 60 seconds
setInterval(checkNodes, 60 * 1000);