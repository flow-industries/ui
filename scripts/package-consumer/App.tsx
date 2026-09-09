import { cn } from "@flow-industries/ui";
import { Button, Input } from "@flow-industries/ui/components";
import {
  NativeSelect,
  NativeSelectOption,
} from "@flow-industries/ui/components/native-select";
import { useState } from "react";
import { MemoryRouter } from "react-router";

export function App(): React.JSX.Element {
  const [count, setCount] = useState(0);
  return (
    <MemoryRouter>
      <main className={cn("p-8", "space-y-4")}>
        <h1>Installed package consumer</h1>
        <label htmlFor="name">Name</label>
        <Input id="name" defaultValue="Alice" />
        <label htmlFor="choice">Room</label>
        <NativeSelect id="choice" defaultValue="lobby">
          <NativeSelectOption value="lobby">Lobby</NativeSelectOption>
          <NativeSelectOption value="arena">Arena</NativeSelectOption>
        </NativeSelect>
        <Button onClick={() => setCount(count + 1)}>Joined {count}</Button>
      </main>
    </MemoryRouter>
  );
}
