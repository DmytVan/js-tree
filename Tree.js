
(function () {

    if (!Element.prototype.closest) {

        Element.prototype.closest = function (css) {
            let node = this;

            while (node) {
                if (node.msMatchesSelector(css)) return node;
                else node = node.parentElement;
            }
            return null;
        };
    }
})();

function ContextMenu(parent) {
    const contextMenu = document.createElement('div');
    const taskList = document.createElement('ul');
    contextMenu.classList.add('context-menu');
    contextMenu.appendChild(taskList);
    parent.appendChild(contextMenu);

    function hideContextMenu() {
        contextMenu.style.display = 'none';
        document.removeEventListener('click', hideContextMenu);
    }

    return {
        setPosition: function (x, y) {
            contextMenu.style.left = x + 'px';
            contextMenu.style.top = y + 'px';
        },
        show: function () {
            contextMenu.style.display = 'inline-block';
            document.addEventListener('click', hideContextMenu)
        },
        addFunc: function (name, fn) {
            const taskName = document.createElement('li');
            taskName.textContent = name;
            taskList.appendChild(taskName);
            taskName.onclick = fn;
        },
        hideContextMenu: hideContextMenu
    }
}


function Tree(parent) {
    this.rootTree = parent;
    this.parentId = 0;
    this.contextMenu = ContextMenu(parent);
    this.selectedItem = null;
    this.data = null;
    this.initialize();
}

Tree.prototype.initialize = function () {
    const rootUl = this.createContainer();
    this.rootTree.treeInfo = {ul: rootUl, children: []};
    this.rootTree.appendChild(rootUl);

    this.rootTree.onclick = function (event) {
        this.changeOpenedState(event.target)
    }.bind(this);

    this.rootTree.ondblclick = function (event) {
        const content = event.target.closest('.Content');
        if (!content) return;
        this.changeOpenedState(content.parentNode.querySelector('.Expand'))
    }.bind(this);

    this.rootTree.onselectstart = function () {
        return false;
    };

    this.settingsContextMenu();
    this.rootTree.oncontextmenu = function (event) {
        const contentDiv = event.target.closest('.Content');

        if (!contentDiv) {
            return;
        }
        this.selectedItem = contentDiv.parentNode;
        this.contextMenu.setPosition(event.clientX, event.clientY);
        this.contextMenu.show();
        return false;
    }.bind(this);
};

Tree.prototype.changeOpenedState = function (item) {
    const clickedElem = item;

    if (!clickedElem.classList.contains('Expand')) {
        return;
    }

    const node = clickedElem.parentNode;
    if (node.classList.contains('ExpandLeaf')) {
        return;
    }

    if (node.classList.contains('ExpandOpen')) {
        node.classList.remove('ExpandOpen');
        node.classList.add('ExpandClosed');
    } else {
        node.classList.remove('ExpandClosed');
        node.classList.add('ExpandOpen');
    }
};

Tree.prototype.createContainer = function () {
    const ul = document.createElement('ul');
    ul.classList.add('Container');
    return ul;
};

Tree.prototype.createItem = function (content) {
    const item = document.createElement('li');
    const container = this.createContainer();
    item.className = 'Node ExpandLeaf IsLast';
    item.treeInfo = {
        ul: container,
        children: []
    };

    this.addContent(item, content);
    item.appendChild(container);
    return item;
};

Tree.prototype.add = function (content) {
    const item = this.createItem(content);
    this.addByElements(item);
};

Tree.prototype.addByElements = function (parent, item) {
    const parentInfo = parent.treeInfo;

    if (parent === this.rootTree) {
        item.classList.add('IsRoot');
    }

    item.treeInfo.parent = parent;
    parentInfo.children.push(item);
    parentInfo.ul.appendChild(item);
    this.checkNeighborClassList(item);
    this.checkParentClassList(item);
};

Tree.prototype.addContent = function (node, content) {
    const expandDiv = document.createElement('div');
    const contentDiv = document.createElement('div');

    expandDiv.classList.add('Expand');
    contentDiv.classList.add('Content');
    contentDiv.innerHTML = content;
    node.appendChild(expandDiv);
    node.appendChild(contentDiv);
    node.treeInfo.content = contentDiv;
};

Tree.prototype.checkNeighborClassList = function (item) {
    const parentInfo = item.treeInfo.parent.treeInfo;

    if (parentInfo.children.length < 1) {
        return;
    }

    for (let i = 0; i < parentInfo.children.length - 1; i++) {
        if (parentInfo.children[i].classList.contains('IsLast'))
            parentInfo.children[i].classList.remove('IsLast');
    }

    if (!parentInfo.children[parentInfo.children.length - 1].classList.contains('IsLast')) {
        parentInfo.children[parentInfo.children.length - 1].classList.add('IsLast');
    }
};

Tree.prototype.checkParentClassList = function (item) {
    const parent = item.treeInfo.parent;
    if (parent === this.rootTree) return;

    const parentInfo = parent.treeInfo;
    if (parentInfo.children.length) {
        if (parent.classList.contains('ExpandLeaf')) {
            parent.classList.remove('ExpandLeaf');
        }

        if (parent.classList.contains('ExpandOpen')) {
            parent.classList.remove('ExpandOpen');
        }

        if (!parent.classList.contains('ExpandClosed')) {
            parent.classList.add('ExpandClosed');
        }
        return;
    }

    if (parent.classList.contains('ExpandClosed')) {
        parent.classList.remove('ExpandClosed');
    }

    if (parent.classList.contains('ExpandOpen')) {
        parent.classList.remove('ExpandOpen');
    }

    if (!parent.classList.contains('ExpandLeaf')) {
        parent.classList.add('ExpandLeaf');
    }
};

Tree.prototype.openItem = function (item) {
    if (item.classList.contains('ExpandLeaf')) {
        return;
    }

    if (item.classList.contains('ExpandClosed')) {
        item.classList.remove('ExpandClosed');
    }

    if (!item.classList.contains('ExpandOpen')) {
        item.classList.add('ExpandOpen');
    }
};

Tree.prototype.closeItem = function (item) {
    if (item.classList.contains('ExpandLeaf')) {
        return;
    }

    if (item.classList.contains('ExpandOpen')) {
        item.classList.remove('ExpandOpen');
    }

    if (!item.classList.contains('ExpandClosed')) {
        item.classList.add('ExpandClosed');
    }
};

Tree.prototype.edit = function (item) {
    const contendDiv = item.treeInfo.content;
    const newText = prompt('New item text', contendDiv.innerHTML);

    if (!newText.trim()) {
        return;
    }

    contendDiv.innerHTML = newText;
};


Tree.prototype.delete = function (item) {
    const itemInfo = item.treeInfo;

    itemInfo.parent.treeInfo.children.splice(itemInfo.parent.treeInfo.children.indexOf(item), 1);
    item.parentNode.removeChild(item);
    this.checkNeighborClassList(item);
    this.checkParentClassList(item);
};

Tree.prototype.settingsContextMenu = function () {
    const self = this;

    this.contextMenu.addFunc('add', function () {
        if (!self.selectedItem) {
            throw new Error('Item was not selected');
        }

        const text = prompt('Item text', '');
        if (!text.trim()) {
            return;
        }
        const item = self.createItem(text);
        self.addByElements(self.selectedItem, item);
        self.openItem(self.selectedItem);
    });

    this.contextMenu.addFunc('edit', function () {
        if (!self.selectedItem) {
            throw new Error('Item was not selected');
        }

        self.edit(self.selectedItem);
    });

    this.contextMenu.addFunc('delete', function () {
        if (!self.selectedItem) {
            throw new Error('Item was not selected');
        }
        if (confirm('delete item?'))
            self.delete(self.selectedItem);
        self.openItem(self.selectedItem.treeInfo.parent);
    });

    this.contextMenu.addFunc('add in root', function () {
        if (!self.selectedItem) {
            throw new Error('Item was not selected');
        }

        const text = prompt('Item text', '');
        if (!text.trim()) {
            return;
        }

        const item = self.createItem(text);
        self.addByElements(self.rootTree, item);
    });
};

Tree.prototype.createTree = function (parent, items) {
    for (let i = 0; i < items.length; i++) {
        const newItem = this.createItem(items[i].content);

        if (items[i].children && items[i].children.length) {
            this.createTree(newItem, items[i].children);
        }

        this.addByElements(parent, newItem)
    }
};

Tree.prototype.setData = function (obj) {
    this.data = obj;
    this.createTree(this.rootTree, this.data);
};

Tree.prototype.setDataByUrl = function (url) {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', url);
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;
        if (xhr.status === 200) {
            this.setData(JSON.parse(xhr.response));
        }
    }.bind(this);


    xhr.send();
};