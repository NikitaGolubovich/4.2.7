class Search {
    constructor(view) {
        this.app = document.querySelector(".search__input");
        this.app.addEventListener(
            "keyup",
            debounce(() => this.createAutofill(this.app.value), 250)
        );
        this.view = view;
    }

    async getRepos(value) {
        return await fetch(
            `https://api.github.com/search/repositories?q=${value}&per_page=5`
        ).then((response) => response.json());
    }

    async createAutofill(value) {
        if (document.querySelector(".search__list")) this.view.removeAutofillList();
        if (value.trim().length !== 0) {
            await this.getRepos(value)
                .then((repos) => this.view.createAutofillList(repos))
                .catch((err) => console.log(err));
        }
    }

    inputCleaner() {
        this.app.value = "";
    }
}

class View {
    constructor() {
        this.container = this.createNewElement("div", "lists");
        document.querySelector(".search").append(this.container);
        this.pinList = this.createNewElement("ul", "search__pin-list");
    }

    createAutofillList(data) {
        const list = this.createNewElement("ul", "search__list");
        data.items.forEach((item) => {
            list.append(this.createNewElement("li", "search__list-item", item.name));
        });
        this.container.prepend(list);
        this.elementsListener(list, data);
    }

    createNewElement(selector, className, text) {
        const element = document.createElement(selector);
        element.classList.add(className);
        if (text) element.innerText = text;
        return element;
    }

    removeAutofillList() {
        document.querySelector(".search__list").remove();
    }

    elementsListener(list, data) {
        const elements = list.querySelectorAll(".search__list-item");
        elements.forEach((element, index) => {
            element.addEventListener("click", () => {
                this.pinElement(data.items[index]);
                search.inputCleaner();
                this.removeAutofillList();
            });
        });
    }

    pinElement(data) {
        const text = `Name: ${data.name}\nOwner: ${data.owner.login}\nStars: ${data.stargazers_count}`;
        const element = this.createNewElement("li", "search__pin-item", text);
        element.append(this.createNewElement("button", "search__pin-button"));
        this.pinList.append(element);
        this.container.append(this.pinList);
        this.pinElementListener();
    }

    pinElementListener() {
        const elements = this.pinList.querySelectorAll(".search__pin-item");
        elements.forEach((element) => {
            const buttonClose = element.querySelector(".search__pin-button");
            buttonClose.addEventListener("click", () => {
                element.remove();
            });
        });
    }
}

const debounce = (fn, debounceTime) => {
    let timeout;

    return function() {
        const fnCall = () => fn.apply(this, arguments);
        clearTimeout(timeout);
        timeout = setTimeout(fnCall, debounceTime);
    };
};

const search = new Search(new View());