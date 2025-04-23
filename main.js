let currentRootComponent = null; // 現在のルートコンポーネント
let root = document.getElementById("root"); // マウント先
let hookStates = []; // useState用の状態保持配列
let hookIndex = 0; // useState呼び出し時のインデックス管理

// 仮想DOMから本物のDOMを作成する関数
function render(vnode) {
  if (typeof vnode === 'string') {
    return document.createTextNode(vnode);
  }

  const el = document.createElement(vnode.type);

  for (const [key, value] of Object.entries(vnode.props || {})) {
    if (key.startsWith("on") && typeof value === "function") {
      // イベントリスナ対応（例: onclick）
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, value);
    } else {
      el.setAttribute(key, value);
    }
  }

  (vnode.children || []).forEach(child => {
    el.appendChild(render(child));
  });

  return el;
}

// useState の簡易実装
function useState(initialValue) {
  const _index = hookIndex;
  hookStates[_index] = hookStates[_index] ?? initialValue;

  const setState = (newVal) => {
    hookStates[_index] = newVal;
    rerender(); // 状態変更後に再描画
  };

  return [hookStates[hookIndex++], setState];
}

// 再描画関数（全て再描画）
function rerender() {
  hookIndex = 0; // useStateの順番リセット
  root.innerHTML = ""; // 前回のDOMを削除
  const vdom = currentRootComponent(); // 関数コンポーネントを再実行
  root.appendChild(render(vdom)); // 再描画
}

// ルートコンポーネント
function App() {
  const [count, setCount] = useState(0);
  return {
    type: "div",
    props: {},
    children: [
      {
        type: "h1",
        props: {},
        children: [`Count: ${count}`],
      },
      {
        type: "button",
        props: {
          onclick: () => setCount(count + 1),
        },
        children: ["+1"],
      },
    ],
  };
}

// 初期描画
currentRootComponent = App;
rerender();
