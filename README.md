# AO-Counter | AO Beginner's Guide 0x01

This article demonstrates the first example of AO, an AO-based counter. Every time the button is clicked, the counter increments by 1, and the clicker's address is recorded in the list in the AO Process.

![image-20240629204106662](https://p.ipic.vip/7w67ro.jpg)

> References:
>
>  >https://github.com/iamgamelover/ao-twitter

Repo:

 > https://github.com/rootMUD/ao-counter

Vercel version:

> https://ao-counter.vercel.app/

Arweave version:

> https://arweave.net/bleZF-gxe_vv0RYMNhHABsvq6wvhvmBBnQ5lfzwJJKQ

Process on `ao.link`:

>https://www.ao.link/#/entity/Rijbx6FduUMdCZM0tJ4PPxXljUNy1m0u_kmMIFGFM5c

## 0x01 What is AO?

> 💡 References:
>
> [AO: Building a Decentralized Erlang](https://permadao.com/permadao/AO-Erlang-ae1c8ab020b24e379457d92014e3d09e)
>
> https://permadao.com/permadao/AO-Erlang-ae1c8ab020b24e379457d92014e3d09e
>
> [Technical Analysis of AO Superparallel Computer](https://permadao.com/permadao/ao-9e58170a1c9c41628b1732eb13098209)
>
>
> https://permadao.com/permadao/ao-9e58170a1c9c41628b1732eb13098209

When we talk about programs, we can abstract them into two things: "computation" and "storage".

Ethereum starts from distributed computing, focusing on smart contracts, then moves towards storage, hence we see ETH Storage.

Arweave starts from distributed storage, completes the storage layer first, and then moves towards computation, hence we see AO.

AO inherits from the Erlang philosophy.

>So, Erlang and AO, along with everything we build, are deeply intertwined. It's not just architecture; it's a philosophy and almost an aesthetic fusion. Although we no longer deal with the phone calls of the '80s, it's still very close. We even designed a logo for it, called the Super Beam.
>
>- AO: Building a Decentralized Erlang

The core of Erlang's philosophy is the design principle of lightweight Processes and the message-passing mechanism between Processes:

```
+-------------+             +-------------+
| Process 0x1 |             | Process 0x2 |
+-------------+             +-------------+
|  Unique ID  |             |  Unique ID  |
+-------------+     Msg     +-------------+
|    Sender   | ----------> |   Handler   |
+-------------+     Msg     +-------------+
|   Handler   | <---------- |    Sender   |
+-------------+             +-------------+
|    Memory   |             |    Memory   |
+-------------+             +-------------+
```

Therefore, we can understand AO as a Perma Decentralized Process Network constructed by countless Processes, where the key point is that Processes are isolated from each other and do not share memory pools.

This is a highly abstract model with many fascinating possibilities when applied to real-world scenarios.

For example, it can be used to build an Autonomous AI Agent Network:

```
                   +--------- An AI Agent(A Process) -----------+
                   |                              Users         |
                   |                                 ↕          |
          Msg      | +----------------+      +----------------+ |
       +------------>| Vector Dataset |---+  | Bot, App, dApp | |
The other AI Agents | |     Upgrade    |   |  +----------------+ |
       &            | |  Autonomouslly |   |          ↕          |
      Users         | +----------------+   |  +----------------+ |
       |            |                      |  |   Multi-LLM    | |
       |            |                      |  +----------------+ |
       |            |                      |          ↕          |
       |            | +----------------+   |  +----------------+ |
       |  Msg       | |  Prompt Chain  |---+--| Edge Functions | |
       +------------>|     Upgrade    |      +----------------+ |
                   | |  Autonomouslly |                         |
                   | +----------------+                         |
                   +--------------------------------------------+
                   |                Unique ID(DID)              |
                   +--------------------------------------------+
                   |                Economic Layer              |
                   +--------------------------------------------+
                   |               Governance Layer             |
                   +--------------------------------------------+
```

>Ref: https://bodhi.wtf/space/5/15063

For more on Erlang philosophy, see:

> Facing software errors to build reliable distributed systems -
>
> https://bodhi.wtf/space/5/15083

## 0x02 Implementation and Deployment of Lua Process

We first implement a lightweight Process using Lua.

### 2.1 Minimalist CLI Operation Guide

For client installation instructions, see:

> https://cookbook_ao.arweave.dev/tutorials/begin/preparations.html

We start an `aos` CLI with:

```bash
$ aos
```

![image-20240628172112665](https://p.ipic.vip/nq4phl.png)

We can view the current Process ID with:

```bash
aos> ao.id
```

![image-20240628172227980](https://p.ipic.vip/xhjsfw.jpg)

 > [ao.link](https://www.ao.link/#/entity/Rijbx6FduUMdCZM0tJ4PPxXljUNy1m0u_kmMIFGFM5c), we can see information related to this Process.

![image-20240628172330751](https://p.ipic.vip/6c4yrf.jpg)

Then, load the code into the Process with:

```bash
aos> .load counter.lua
```

The code can then be loaded into `process`.

![image-20240628172533355](https://p.ipic.vip/lskm5h.jpg)

### 2.2 Process Core Code Analysis

```lua
Players = Players or {}

-- bizz buzz
count = 0
-- .load counter.lua
-- Send({ Target = ao.id, Action = "Click" })

Handlers.add(
  "AddNew",
  Handlers.utils.hasMatchingTag("Action", "AddNew"),
  function (msg)
    table.insert(Players, msg.Data)
    count = #Players
    Handlers.utils.reply("bizz buzz")(msg)
  end
)

Handlers.add(
  "Info",
  Handlers.utils.hasMatchingTag("Action", "Info"),
  function (msg)
    -- TODO: impl the info with the source code of this snippet
    info = [[
Players = Players or {}

-- bizz buzz
count = 0
-- .load counter.lua
-- Send({ Target = ao.id, Action = "Click" })

Handlers.add(
  "AddNew",
  Handlers.utils.hasMatchingTag("Action", "AddNew"),
  function (msg)
    table.insert(Players, msg.Data)
    count = #Players
    Handlers.utils.reply("bizz buzz")(msg)
  end
)
    ]]
    Handlers.utils.reply(info)(msg)
  end
)
```

Initially, we define a list `Players` and an integer `counter`:

```lua
Players = Players or {}
count = 0
```

Core Handler:

```lua
Handlers.add(
  "AddNew",
  Handlers.utils.hasMatchingTag("Action", "AddNew"),
  function (msg)
    table.insert(Players, msg.Data)
    count = #Players
    Handlers.utils.reply("bizz buzz")(msg)
  end
)
```

"AddNew" is the name of the Handler. `Handlers.utils.hasMatchingTag("Action", "AddNew")` means that if the message action is "AddNew", this Handler is triggered.

When triggered, the anonymous function performs two operations:

```lua
table.insert(Players, msg.Data)
count = #Players
```

- Inserts a new item into the list with the value of `msg.Data`.
- Updates the counter to the length of the `Players` list.

```lua
Handlers.utils.reply("bizz buzz")(msg)
```

The function returns `bizz buzz`.

```lua
Handlers.add(
  "Info",
  Handlers.utils.hasMatchingTag("Action", "Info"),
  function (msg)
    -- TODO: impl the info with the source code of this snippet
    info = [[
Players = Players or {}

-- bizz buzz
count = 0
-- .load counter.lua
-- Send({ Target = ao.id, Action = "Click" })

Handlers.add(
  "AddNew",
  Handlers.utils.hasMatchingTag("Action", "AddNew"),
  function (msg)
    table.insert(Players, msg.Data)
    count = #Players
    Handlers.utils.reply("bizz buzz")(msg)
  end
)
    ]]
    Handlers.utils.reply(info)(msg)
  end
```

The core function of the second Handler is to return other source codes, achieving code open-sourcing in a tricky way.

Click "Fetch" on `ao.link` to view Info:

![image-20240628173213651](https://p.ipic.vip/efhvxt.jpg

### 2.3 More CLI Operations

After loading the `.lua` file, we can practice more operations in the CLI.

* `Players`:
* View the value of the variable.

![image-20240629081408027](https://p.ipic.vip/74ev1n.jpg

> 💡 You can also directly run Lua code.

* `Send({ Target = ao.id, Data = "0x0", Action = "AddNew" })`: Send information to the Process.

## 0x03 Implementation and Deployment of React Frontend

Lua Process acts as the backend of the traditional program. After implementing the Lua Process, we then develop the frontend to call the Lua Process and complete our program.

### 3.1 Frontend Core Code

> See:
>
>
> https://github.com/rootMUD/ao_counter/tree/main/dapp

#### 3.1.1 Environment Variables

Configure the Unique ID of the Process in `dapp/src/app/util/consts.ts`, here it is `AO_COUNTER`:

```typescript
export const AO_COUNTER = "Rijbx6FduUMdCZM0tJ4PPxXljUNy1m0u_kmMIFGFM5c";
```

#### 3.1.2 Process Variable Call 

`dapp/src/app/pages/SitePage.tsx`:

```typescript
...
import {
  getWalletAddress,
  getDataFromAO,
  connectWallet,
  messageToAO,
  shortAddr,
} from "../util/util";
...
async getCount() {
    let replies = await getDataFromAO(AO_COUNTER, "GetCount");
    console.log("get count:", replies);
    this.setState({ count: replies }); // Update state with the count
  }
  async start() {
    this.getCount();
  }
...
```

Use the encapsulated `getDataFromAO` method to get the variables from the Process.

#### 3.1.3 Process Function Call 

```typescript
...
async addCount() {
    let response = await messageToAO(AO_COUNTER, this.state.address, "AddNew");
    console.log("add count:", response);
  }
...
handleClick = (e: { currentTarget: any }) => {
  console.log("Button clicked!");
  const button = e.currentTarget;
  const ripple = document.createElement("span");
  ripple.classList.add("ripple");
  button.appendChild(ripple);

  // Remove the span after the animation is done
  setTimeout(() => {
    ripple.remove();
  }, 600);

  this.addCount();
  setTimeout(() => {
    this.getCount();
  }, 1000); // Delay getCount by 1 second
};
...
<div className="button-container">
  <button onClick={this.handleClick}>+ 1</button>
  <p>
    {" "}
    ={">"} {this.state.count}
  </p>
</div>
...
```

When the `button` is clicked, it calls the `handleClick` function, which in turn calls the `messageToAO` method to pass information to the process.

#### 3.1.4 Wallet Connection Module 

```typescript
...
async disconnectWallet() {
  this.setState({ message: "Disconnect..." });

  Server.service.setIsLoggedIn("");
  Server.service.setActiveAddress("");
  localStorage.removeItem("id_token");

  this.setState({ address: "", message: "" });
}

async connect2ArConnect() {
  let connected = await connectWallet();
  if (connected) {
    let address = await getWalletAddress();
    this.setState({ address: address });
    console.log("user address:", address);
    this.afterConnected(address);
  }
}

async afterConnected(address: string, othent?: any) {
  Server.service.setIsLoggedIn(address);
  Server.service.setActiveAddress(address);
}
...
{this.state.address ? (
  <div>
    <div
      className="app-icon-button connect"
      onClick={() => this.disconnectWallet()}
    >
      {shortAddress}
    </div>
  </div>
) : (
  <div
    className="app-icon-button connect"
    onClick={() => this.connect2ArConnect()}
  >
    <BsWallet2 size={20} />
    ArConnect
  </div>
)}
```

Call the `ArConnect` wallet to get the Wallet Address.

### 3.2 Deploy to Vercel %HEADING%3-2-deploy-to-vercel%HEADING%

We installed the `vercel` plugin in `dapp`, so it can be deployed to the Vercel hosting platform with one command:

```bash
$ yarn vercel --prod
```

> After deployment, it can be accessed at:

https://ao-counter.vercel.app

![image-20240629083247918](https://p.ipic.vip/r6v0j5.jpg

### 3.3 Unstoppable Program — Deploy to Arweave %HEADING%3-3-unstoppable-program-deploy-to-arweave%HEADING%

We can also choose to host the frontend program on `Arweave`, achieving complete decentralization.

>💡 Guide Video:
>
>
>https://www.youtube.com/watch?v=Va5B4SE8Zu8

Using ArDrive as an example:

1. Generate static pages using `yarn build`.
   ![image-20240629155434230](https://p.ipic.vip/nwj2mk.jpg)

2. Upload the folder to ArDrive.
   ![image-20240629155518460](https://p.ipic.vip/s6ak30.jpg)

3. Generate a `manifest` for the website.
   ![image-20240629155533954](https://p.ipic.vip/zc1hok.jpg)


4. Copy the `manifest` ID to access it:
   ![image-20240629160133552](https://p.ipic.vip/zlzvt9.jpg)

By visiting:

> https://arweave.net/{transaction ID}

you can access your deployed application!

5. Configure a traditional domain name.

* Create a new repository using this repository as a template:

>https://github.com/NonceGeek/scaffold-wabi-sabi
>![image-20240629155638448](https://p.ipic.vip/daqyz6.jpg)

* Modify `index.html`:
  ![image-20240629155938382](https://p.ipic.vip/igr9bx.jpg)

* Modify `desktopURL` and `mobileURL`:
  ![image-20240629160417524](https://p.ipic.vip/eggtxk.jpg)

* Import the redirect page on Vercel:
  ![image-20240629160524449](https://p.ipic.vip/a3aeke.jpg)
  ![image-20240629160540526](https://p.ipic.vip/gudvl5.jpg)

* Configure the domain (not elaborated here):
  ![image-20240629160838089](https://p.ipic.vip/lf473h.jpg)

![image-20240629160903787](https://p.ipic.vip/0r8y8v.jpg)

Then you can access it via a custom domain name!

> https://ao-counter.rootmud.xyz

