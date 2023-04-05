document.getElementById('exportBtn').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: exportChatSession,
    });
  } catch (error) {
    console.error('Error executing script:', error);
  }
});

function exportChatSession() {
  const sessionTitleElement = document.querySelector('.rounded-md.bg-gray-800.cursor-pointer .relative');
  const sessionTitle = sessionTitleElement ? sessionTitleElement.textContent.trim() : 'ChatGPT';

  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().slice(2, 10).replace(/-/g, '');

  // 获取聊天记录的 DOM 元素
  const chatElements = document.querySelectorAll('.text-base');
  const chatData = [sessionTitle];

  // 提取聊天记录内容
  chatElements.forEach((chatElement, index) => {
    let message = chatElement.textContent;

    // 移除冗余文本
    message = message.replace(/1 \/ 1/, '');

    // 替换 "Copy code" 为换行符，并移除语言名称
    message = message.replace(/(\w+)?Copy code/, '\n');

    // 插入分隔符
    const separator = index % 2 === 0 ? 'Q' : 'A';
    const separatorString = `----------------------- ${separator} ----------------------\n`;

    // 如果是第一条消息，则在开头添加 'Q' 分隔符
    if (index === 0) {
      message = separatorString + message;
    } else {
      message = separatorString + message;
    }

    chatData.push(message);
  });

  // 如果提取到了聊天记录，继续导出为文件
  if (chatData.length > 0) {
    const chatBlob = new Blob([chatData.join('\n\n')], { type: 'text/plain;charset=utf-8' });

    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(chatBlob);



    const fileName = `${sessionTitle}-${formattedDate}.txt`;

    downloadLink.download = fileName
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();

    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadLink.href);
  }
}