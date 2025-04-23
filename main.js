let currentRootComponent = null; // 現在のルートコンポーネント
let root = document.getElementById("root"); // マウント先
let hookStates = []; // useState用の状態保持配列
let hookIndex = 0; // useState呼び出し時のインデックス管理
let oldVNode = null; // 前回の仮想DOMを保持

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

function updateElement(parent, newVNode, oldVNode, index = 0) {
  const existingDom = parent.childNodes[index];

  // 1. 削除
  if (!newVNode) {
    if (existingDom) {
      parent.removeChild(existingDom);
    }
    return;
  }

  // 2. 新規追加
  if (!oldVNode) {
    parent.appendChild(render(newVNode));
    return;
  }

  // 3. タイプが違う → 差し替え
  if (newVNode.type !== oldVNode.type) {
    parent.replaceChild(render(newVNode), existingDom);
    return;
  }

  // 4. テキストノード
  if (typeof newVNode === "string" || typeof oldVNode === "string") {
    if (newVNode !== oldVNode) {
      parent.replaceChild(render(newVNode), existingDom);
    }
    return;
  }

  // 5. 同じタイプ → 属性更新
  updateProps(existingDom, newVNode.props, oldVNode.props);

  // 6. 子要素を再帰的に比較
  const newChildren = newVNode.children || [];
  const oldChildren = oldVNode.children || [];
  const max = Math.max(newChildren.length, oldChildren.length);
  for (let i = 0; i < max; i++) {
    updateElement(existingDom, newChildren[i], oldChildren[i], i);
  }
}

// 属性更新処理
function updateProps(dom, newProps = {}, oldProps = {}) {
  // 削除された属性
  for (const key in oldProps) {
    if (!(key in newProps)) {
      dom.removeAttribute(key);
    }
  }

  // 新規 or 更新された属性
  for (const key in newProps) {
    const newVal = newProps[key];
    const oldVal = oldProps[key];

    if (key.startsWith("on") && typeof newVal === "function") {
      const event = key.slice(2).toLowerCase();
      if (oldVal !== newVal) {
        if (oldVal) dom.removeEventListener(event, oldVal);
        dom.addEventListener(event, newVal);
      }
    } else if (newVal !== oldVal) {
      dom.setAttribute(key, newVal);
    }
  }
}

// 再描画（差分あり版）
function rerender() {
  hookIndex = 0;
  const newVNode = currentRootComponent();
  updateElement(root, newVNode, oldVNode);
  oldVNode = newVNode;
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
